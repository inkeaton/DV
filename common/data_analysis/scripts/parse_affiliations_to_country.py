import pandas as pd
import re

US_MARKER_RE = re.compile(r'(?<!\w)(USA|US|U\.S\.A\.|U\.S\.|United States)(?!\w)', re.IGNORECASE)
ATT_RE = re.compile(r'(?<!\w)(AT&T|AT\s*&\s*T|AT\s+and\s+T)(?!\w)', re.IGNORECASE)

# --- US states/territories (to avoid DE=Germany, IL=Israel, AR=Argentina, ID=Indonesia, etc.) ---
US_STATE_CODES = {
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
    "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK",
    "OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
    # Optional territories (sometimes appear)
    "PR","VI","GU","AS","MP"
}

# Detect state + ZIP e.g. ", CA 94720" or " CA 94720-1234"
US_STATE_ZIP_RE = re.compile(
    r"(?:,|\s)\s*(?:"
    + "|".join(sorted(US_STATE_CODES))
    + r")\s+\d{5}(?:-\d{4})?\b"
)

# Detect state context even without ZIP: ", DE" ", IL" ", OR" etc (common in affiliations)
US_STATE_CONTEXT_RE = re.compile(
    r"(?:,|\s)\s*(?P<st>" + "|".join(sorted(US_STATE_CODES)) + r")\b"
)

# -----------------------------
# 1) Standard Country Map (Official names + common abbreviations)
#    NOTE: We handle short codes (US/UK/IN/...) case-sensitively to avoid false matches (e.g., "in" -> India).
# -----------------------------
COUNTRY_MAP_RAW = {
    # Argentina
    "AR": "Argentina",
    "Argentina": "Argentina",

    # Australia
    "AU": "Australia",
    "Australia": "Australia",

    # Austria
    "AT": "Austria",
    "Austria": "Austria",

    # Bangladesh
    "BD": "Bangladesh",
    "Bangladesh": "Bangladesh",

    # Belgium
    "BE": "Belgium",
    "Belgium": "Belgium",

    # Brazil
    "BR": "Brazil",
    "Brazil": "Brazil",

    # Canada
    "Canada": "Canada",

    # Chile
    "CL": "Chile",
    "Chile": "Chile",

    # China
    "CN": "China",
    "China": "China",
    "PRC": "China",

    # Colombia
    "CO": "Colombia",
    "Colombia": "Colombia",

    # Czech Republic / Czechia
    "CZ": "Czech Republic",
    "Czech Republic": "Czech Republic",
    "Czechia": "Czech Republic",

    # Denmark
    "DK": "Denmark",
    "Denmark": "Denmark",

    # Egypt
    "EG": "Egypt",
    "Egypt": "Egypt",

    # Finland
    "FI": "Finland",
    "Finland": "Finland",

    # France
    "FR": "France",
    "France": "France",

    # Germany
    "Deutschland": "Germany",
    "Germany": "Germany",

    # Greece
    "GR": "Greece",
    "Greece": "Greece",

    # Hong Kong (often appears like a “country” in affiliations)
    "HK": "Hong Kong",
    "Hong Kong": "Hong Kong",

    # Hungary
    "HU": "Hungary",
    "Hungary": "Hungary",

    # India  (IMPORTANT: "IN" is case-sensitive in matching; do NOT treat lowercase "in" as India)
    "IN": "India",
    "India": "India",

    # Indonesia
    "Indonesia": "Indonesia",

    # Iran
    "IR": "Iran",
    "Iran": "Iran",

    # Iraq
    "IQ": "Iraq",
    "Iraq": "Iraq",

    # Ireland
    "IE": "Ireland",
    "Ireland": "Ireland",

    # Israel
    "Israel": "Israel",

    # Italy
    "IT": "Italy",
    "Italy": "Italy",

    # Japan
    "JP": "Japan",
    "Japan": "Japan",

    # Malaysia
    "MY": "Malaysia",
    "Malaysia": "Malaysia",

    # Mexico
    "MX": "Mexico",
    "Mexico": "Mexico",

    # Netherlands
    "NL": "Netherlands",
    "Netherlands": "Netherlands",
    "The Netherlands": "Netherlands",

    # New Zealand
    "NZ": "New Zealand",
    "New Zealand": "New Zealand",

    # Norway
    "NO": "Norway",
    "Norway": "Norway",

    # Pakistan
    "PK": "Pakistan",
    "Pakistan": "Pakistan",

    # Philippines
    "PH": "Philippines",
    "Philippines": "Philippines",

    # Poland
    "PL": "Poland",
    "Poland": "Poland",

    # Portugal
    "PT": "Portugal",
    "Portugal": "Portugal",

    # Qatar
    "QA": "Qatar",
    "Qatar": "Qatar",

    # Russia
    "RU": "Russia",
    "Russia": "Russia",

    # Saudi Arabia
    "KSA": "Saudi Arabia",
    "Saudi Arabia": "Saudi Arabia",

    # Singapore
    "SG": "Singapore",
    "Singapore": "Singapore",

    # Slovakia
    "SK": "Slovakia",
    "Slovakia": "Slovakia",

    # Slovenia
    "SI": "Slovenia",
    "Slovenia": "Slovenia",

    # South Africa
    "ZA": "South Africa",
    "South Africa": "South Africa",

    # South Korea
    "KR": "South Korea",
    "Korea": "South Korea",
    "South Korea": "South Korea",

    # Spain
    "ES": "Spain",
    "Spain": "Spain",

    # Sweden
    "SE": "Sweden",
    "Sweden": "Sweden",

    # Switzerland
    "CH": "Switzerland",
    "Switzerland": "Switzerland",

    # Taiwan
    "TW": "Taiwan",
    "Taiwan": "Taiwan",

    # Thailand
    "TH": "Thailand",
    "Thailand": "Thailand",

    # United Arab Emirates
    "AE": "United Arab Emirates",
    "UAE": "United Arab Emirates",
    "United Arab Emirates": "United Arab Emirates",

    # United Kingdom
    "Great Britain": "United Kingdom",
    "UK": "United Kingdom",
    "United Kingdom": "United Kingdom",

    # United States  (include dotted variants too)
    "U.S.": "United States",
    "U.S.A.": "United States",
    "US": "United States",
    "USA": "United States",
    "United States": "United States",

    # Vietnam
    "VN": "Vietnam",
    "Viet Nam": "Vietnam",
    "Vietnam": "Vietnam",
}

# Make insertion order alphabetical by key (case-insensitive)
COUNTRY_MAP = dict(sorted(COUNTRY_MAP_RAW.items(), key=lambda kv: kv[0].casefold()))


# -----------------------------
# 2) Institution / City / State inference map (keywords -> country)
#    (Alphabetical by key; add more university/country variants, incl. Vietnam + SE Asia)
# -----------------------------
KEYWORD_MAP_RAW = {
    # -------- Argentina --------
    "INGEOSUR CONICET": "Argentina",
    "UNS, VyGLab": "Argentina",
    "Universidad de Buenos Aires": "Argentina",
    "University of Buenos Aires": "Argentina",

    # -------- Australia --------
    "Australian National University": "Australia",
    "Monash": "Australia",
    "Monash University": "Australia",
    "The University of Queensland": "Australia",
    "University of Melbourne": "Australia",
    "University of Sydney": "Australia",

    # -------- Austria --------
    "Graz": "Austria",
    "Kapsch TrafficCom AG": "Austria",
    "TU Wien": "Austria",
    "Vienna": "Austria",
    "University of Vienna": "Austria",
    "VRVis": "Austria",
    "VRVis Research Center": "Austria",
    "University of Applied Sciences Upper Austria": "Austria",

    # -------- Bangladesh --------
    "Bangladesh University of Engineering and Technology": "Bangladesh",
    "BUET": "Bangladesh",
    "University of Dhaka": "Bangladesh",

    # -------- Brazil --------
    "Federal University of Ceara": "Brazil",
    "Federal University of Rio Grande do Sul": "Brazil",
    "PUC-Rio": "Brazil",
    "Tecgraf Institute, PUC-Rio": "Brazil",
    "UFES": "Brazil",
    "UFRGS": "Brazil",
    "Universidade Federal Fluminense": "Brazil",
    "University of Campinas": "Brazil",
    "University of São Paulo": "Brazil",

    # -------- Canada --------
    "An Independent Researcher": "Canada",
    "British Columbia": "Canada",
    "University of British Columbia": "Canada",
    "Dalhousie University": "Canada",
    "IRI": "Canada",
    "Ontario Tech University": "Canada",
    "UOIT": "Canada",
    "Simon Fraser University": "Canada",
    "Toronto": "Canada",
    "University of Toronto": "Canada",
    "Université Laval": "Canada",
    "University of Calgary": "Canada",
    "University of Manitoba": "Canada",
    "University of Ontario Institute of Technology": "Canada",
    "University of Ontario, Institute of Technology": "Canada",
    "University of Victoria": "Canada",
    "Vancouver": "Canada",
    "OCAD University": "Canada",
    "OCADU": "Canada",

    # -------- Belgium --------
    "SSS, Belgian F.R.S.-FNRS.": "Belgium", 

    # -------- Chile --------
    "Pontificia Universidad Católica de Chile": "Chile",
    "University of Chile": "Chile",

    # -------- China --------
    "Chinese Academy of Sciences": "China",
    "Peking": "China",
    "Peking University": "China",
    "Shanghai Jiao Tong University": "China",
    "Shenzhen Institutes of Advanced Technology": "China",
    "Shenzhen University": "China",
    "Sichuan University": "China",
    "Tianjin University": "China",
    "Tongji University": "China",
    "Tsinghua": "China",
    "Tsinghua University": "China",
    "Dept. of Comp. Sci. & Tech., CBICR Center": "China",
    "Xi'an Jiaotong University": "China",
    "Zhejiang": "China",
    'Microsoft Research Asia': "China",
    "Zhejiang University": "China",
    "University of Macau": "China",
    "Microsoft Research, Beijing": "China",

    # -------- Colombia --------
    "Universidad de los Andes": "Colombia",
    "University of the Andes": "Colombia",

    # -------- Czech Republic --------
    "Czech Technical University": "Czech Republic",
    "Masaryk University": "Czech Republic",

    # -------- Denmark --------
    "Technical University of Denmark": "Denmark",
    "DTU": "Denmark",
    "University of Copenhagen": "Denmark",

    # -------- Egypt --------
    "Ain Shams University": "Egypt",
    "Cairo University": "Egypt",

    # -------- Finland --------
    "Aalto University": "Finland",
    "University of Helsinki": "Finland",
    "University of Tampere": "Finland",

    # -------- France --------
    "CNRS": "France",
    "ENAC": "France",
    "INRIA": "France",
    "Inria": "France",
    "INRIA Futurs": "France",
    "Paris": "France",
    "Sorbonne University": "France",
    "University of Paris-Sud 11": "France", 
    "Microsoft Research-Inria Joint Centre" : "France",
    "IRT SystemX": "France",

    # -------- Germany --------
    "Bauhaus-Universität Weimar": "Germany",
    "Berlin": "Germany",
    "BOSCH Research": "Germany",
    "Darmstadt": "Germany",
    "Fraunhofer": "Germany",
    "GFZ German Research Centre for Geosciences": "Germany",
    "German Climate Computing Center": "Germany",
    "Heidelberg": "Germany",
    "Hewlett-Packard GmbH": "Germany",
    "Karlsruhe Institute of Technology": "Germany",
    "Konstanz": "Germany",
    "University of Konstanz": "Germany",
    "Leipzig University": "Germany",
    "Macrofocus GmbH": "Germany",
    "Max Planck Institute for Evolutionary Biology": "Germany",
    "Max Planck Institute for Informatics": "Germany",
    "Munich": "Germany",
    "Technische Universitat Munchen": "Germany",
    "Universitat Hamburg": "Germany",
    "Otto von Guericke Universitat Magdeburg": "Germany",
    "Westfalische Wilhelms-Universitat Munster": "Germany",
    "Martin Luther University of Halle-Wittenberg": "Germany",
    "Potsdam University of Applied Sciences": "Germany",
    "Robert Bosch Research": "Germany",
    "Robert Bosch Research and Technology Center": "Germany",
    "Saarland University": "Germany",
    "Stuttgart": "Germany",
    "University of Stuttgart": "Germany",
    "TU Dresden": "Germany",
    "TU Kaiserslautern": "Germany",
    "Technische Universitat Dresden": "Germany",
    "Technische Universität München": "Germany",
    "Technische Universität Műnchen": "Germany",
    "Technical University of Munich": "Germany",
    "University of Munich (LMU)": "Germany",
    "TUM": "Germany",
    "Universität Bonn": "Germany",
    "University of Bonn": "Germany",
    "Universität Kaiserslautern": "Germany",
    "Universität Leipzig": "Germany",
    "University of Duisburg-Essen": "Germany",
    "University of Magdeburg": "Germany",
    "University of Rostock": "Germany",
    "University of Tübingen": "Germany",
    "Ulm University": "Germany",
    "WSI/GRIS University of Tübingen": "Germany",
    "Technical University of Darmstadt": "Germany",
    "ZGDV Darmstadt": "Germany",
    "University of Kaiserslautern": "Germany",

    # -------- Greece --------
    "Aristotle University of Thessaloniki": "Greece",
    "National Technical University of Athens": "Greece",
    "NTUA": "Greece",

    # -------- Hong Kong --------
    "Hong Kong University of Science and Technology": "Hong Kong",
    "HKUST": "Hong Kong",
    "The University of Hong Kong": "Hong Kong",
    "University of Hong Kong": "Hong Kong",
    "HKU": "Hong Kong",
    "The Chinese University of Hong Kong": "Hong Kong",
    "CUHK": "Hong Kong",

    # -------- Hungary --------
    "Eötvös Loránd University": "Hungary",
    "ELTE": "Hungary",

    # -------- Hong Kong --------
    "Hong Kong University of Science and Technology": "Hong Kong",
    "HKUST": "Hong Kong",
    "The University of Hong Kong": "Hong Kong",
    "University of Hong Kong": "Hong Kong",
    "HKU": "Hong Kong",
    "The Chinese University of Hong Kong": "Hong Kong",
    "CUHK": "Hong Kong",

    # -------- India --------
    "Indian Institute of Science": "India",
    "IISc": "India",
    "Indian Institute of Technology": "India",
    "Indian Institute of Technology Kharagpur": "India",
    "IIT": "India",
    "IIT Kharagpur": "India",

    # -------- Indonesia --------
    "Bandung Institute of Technology": "Indonesia",
    "Institut Teknologi Bandung": "Indonesia",
    "ITB": "Indonesia",
    "Gadjah Mada University": "Indonesia",
    "Universitas Gadjah Mada": "Indonesia",
    "University of Indonesia": "Indonesia",
    "Universitas Indonesia": "Indonesia",
    "UI": "Indonesia",
    "Sepuluh Nopember Institute of Technology": "Indonesia",
    "ITS": "Indonesia",

    # -------- Iran --------
    "Amirkabir University of Technology": "Iran",
    "Sharif University of Technology": "Iran",
    "University of Tehran": "Iran",

    # -------- Iraq --------
    "University of Basrah": "Iraq",
    "University of Baghdad": "Iraq",

    # -------- Ireland --------
    "Trinity College Dublin": "Ireland",
    "University College Dublin": "Ireland",
    "UCD": "Ireland",

    # -------- Israel --------
    "Tel Aviv Univeristy": "Israel",
    "Tel Aviv University": "Israel",
    "Tel-Aviv University": "Israel",
    "Technion": "Israel",
    "The Hebrew University of Jerusalem": "Israel",
    "University of Haifa": "Israel",

    # -------- Italy --------
    'La Sapienza University of Rome': "Italy",
    'Sapienza University of Rome': "Italy",
    'University of Rome La Sapienza': "Italy",
    "Politecnico di Milano": "Italy",
    "University of Bologna": "Italy",

    # -------- Japan --------
    "Kyoto": "Japan",
    "Tokyo": "Japan",
    "University of Tokyo": "Japan",
    "The University of Tokyo": "Japan",

    # -------- Malaysia --------
    "Monash University Malaysia": "Malaysia",
    "Universiti Teknologi Malaysia": "Malaysia",

    # -------- Mexico --------
    "National Autonomous University of Mexico": "Mexico",
    "UNAM": "Mexico",
    "Tecnológico de Monterrey": "Mexico",
    "Tec de Monterrey": "Mexico",

    # -------- Netherlands --------
    "Centrum Wiskunde & Informatica (CWI)": "Netherlands",
    "CWI": "Netherlands",
    "Delft": "Netherlands",
    "Eindhoven": "Netherlands",
    "University of Amsterdam": "Netherlands",
    "University of Groningen": "Netherlands",
    "TU Delft": "Netherlands",

    # -------- Norway --------
    "Univ. of Bergen": "Norway",
    "University of Bergen": "Norway",
    "University of Bergen and Rainfall AS Bergen": "Norway",

    # -------- Pakistan --------
    "Lahore University of Management Sciences": "Pakistan",
    "LUMS": "Pakistan",
    "National University of Sciences and Technology": "Pakistan",
    "NUST": "Pakistan",
    "Quaid-i-Azam University": "Pakistan",

    # -------- Philippines --------
    "Ateneo de Manila University": "Philippines",
    "De La Salle University": "Philippines",
    "University of the Philippines": "Philippines",
    "UP Diliman": "Philippines",

    # -------- Poland --------
    "AGH University of Science and Technology": "Poland",
    "University of Warsaw": "Poland",
    "Warsaw University of Technology": "Poland",

    # -------- Portugal --------
    "University of Porto": "Portugal",
    "Universidade do Porto": "Portugal",
    "IST Lisbon": "Portugal",
    "Instituto Superior Técnico": "Portugal",

    # -------- Qatar --------
    "Hamad Bin Khalifa University (HBKU)": "Qatar",
    "Hamad Bin Khalifa University": "Qatar",
    "HBKU": "Qatar",
    "Qatar University": "Qatar",

    # -------- Russia --------
    "Lomonosov Moscow State University": "Russia",
    "Moscow State University": "Russia",
    "Skolkovo Institute of Science and Technology": "Russia",
    "Skoltech": "Russia",

    # -------- Saudi Arabia --------
    "KAUST": "Saudi Arabia",
    "King Abdullah University of Science and Technology (KAUST)": "Saudi Arabia",
    "King Abdullah University of Science and Technology": "Saudi Arabia",
    "Umm Al-Qura University": "Saudi Arabia",

    # -------- Singapore --------
    "Agency for Science, Technology and Research": "Singapore",
    "A*STAR": "Singapore",
    "Nanyang Technological University": "Singapore",
    "NTU": "Singapore",
    "National University of Singapore": "Singapore",
    "NUS": "Singapore",
    "Singapore Management University": "Singapore",
    "SMU": "Singapore",
    "Singapore University of Technology and Design": "Singapore",
    "SUTD": "Singapore",

    # -------- Slovakia --------
    "Slovak Academy of Sciences": "Slovakia",

    # -------- Slovenia --------
    "University of Ljubljana": "Slovenia",

    # -------- South Africa --------
    "Stellenbosch University": "South Africa",
    "University of Cape Town": "South Africa",
    "UCT": "South Africa",
    "University of the Witwatersrand": "South Africa",
    "Wits University": "South Africa",

    # -------- South Korea --------
    "KAIST": "South Korea",
    "Seoul": "South Korea",
    "UNIST": "South Korea",
    "Ulsan Nat'l Inst. of Science and Technology (UNIST)": "South Korea",
    "Sejong University": "South Korea",

    # -------- Spain --------
    "Barcelona Supercomputing Center": "Spain",
    "CCS": "Spain",
    "UPC": "Spain",
    "UPC Barcelona": "Spain",
    "UPM": "Spain",
    "URJC": "Spain",
    "U-tad": "Spain",
    "ViRVIG Group": "Spain",

    # -------- Sweden --------
    "Chalmers University of Technology": "Sweden",
    "KTH Royal Institute of Technology": "Sweden",
    "KTH": "Sweden",
    "Linköping University": "Sweden",

    # -------- Switzerland --------
    "EPFL": "Switzerland",
    "Ecole Polytechnique Fédérale de Lausanne": "Switzerland",
    "ETH": "Switzerland",
    "ETH Zürich": "Switzerland",
    "ETH Zurich": "Switzerland",
    "Zurich": "Switzerland",

    # -------- Taiwan --------
    "National Chiao Tung University": "Taiwan",
    "National Taiwan University": "Taiwan",
    "NTU Taiwan": "Taiwan",

    # -------- Thailand --------
    "Asian Institute of Technology": "Thailand",
    "AIT": "Thailand",
    "Chulalongkorn University": "Thailand",
    "King Mongkut's University of Technology Thonburi": "Thailand",
    "KMUTT": "Thailand",
    "Mahidol University": "Thailand",

    # -------- Turkey --------
    "Boğaziçi University": "Turkey",
    "Istanbul Technical University": "Turkey",
    "Middle East Technical University": "Turkey",
    "Sabanci University": "Turkey",
    "Bilkent University": "Turkey",

    # -------- United Arab Emirates --------
    "American University of Sharjah": "United Arab Emirates",
    "Khalifa University": "United Arab Emirates",
    "United Arab Emirates University": "United Arab Emirates",
    "UAE University": "United Arab Emirates",

    # -------- United Kingdom --------
    "Bangor University": "United Kingdom",
    "Cambridge": "United Kingdom",
    "Lancaster University": "United Kingdom",
    "London": "United Kingdom",
    "City University": "United Kingdom",
    "Middlesex University": "United Kingdom",
    "Oxford": "United Kingdom",
    "Swansea University": "United Kingdom",
    "University of Bristol": "United Kingdom",
    "University of Chester": "United Kingdom",
    "University of East Anglia": "United Kingdom",
    "University of Lincoln": "United Kingdom",

    # -------- United States (labs/companies) --------
    "Air Force Research Laboratory": "United States",
    "AT and T Laboratories": "United States",
    "AT and T Bell Laboratories, Inc.": "United States",
    "Allen Institute for Cell Science": "United States",
    "American Museum of Natural History": "United States",
    "Adobe": "United States",
    "Aptima Inc.": "United States",
    "Argonne National Laboratory": "United States",
    "Arizona State University": "United States",
    "Battelle Memorial Institute": "United States",
    "Battelle Pacific Northwest Division": "United States",
    "Bell Communications Research": "United States",
    "Brigham and Women's Hospital": "United States",
    "Brookhaven National Laboratory": "United States",
    "Brown University": "United States",
    "Bucknell University": "United States",
    "Caltech": "United States",
    "Carnegie Mellon": "United States",
    "Center for Applied Scientific Computing, Lawrence Livermore National Laboratory": "United States",
    "Lawrence Livemore National Laboratory": "United States",
    "Cahners MicroDesign Resources": "United States",
    "Columbia University": "United States",
    "Computer Science Corporation": "United States",
    "Congressional Budget Office, United States Congress": "United States",
    'Congressional Budget Office': "United States",
    "Dana-Farber Cancer Institute": "United States",
    "Data Visualization Research Laboratory": "United States",
    "DePaul University": "United States",
    "Discovery Analytics Center": "United States",
    "Duke University": "United States",
    "Facebook": "United States",
    "Florida State University": "United States",
    "Folger Shakespeare Library": "United States",
    "Ford Motor Company": "United States",
    "FX Palo Alto Laboratory": "United States",
    "General Electric CRD": "United States",
    "Georgia Institute of Technology": "United States",
    "Georgia Tech": "United States",
    "Gonzaga University": "United States",
    "Google": "United States",
    "Grand Valley State University": "United States",
    "Harvard": "United States",
    "Harvard University": "United States",
    "Harvard University.": "United States",
    "Harvard Medical School": "United States",
    "Rutgers University": "United States",
    "H2O.ai, UIC": "United States",
    "Ask.com": "United States",
    "IBM": "United States",
    "IBM J. Watson Research Center": "United States",
    "IBM T.J. Watson Research Center": "United States",
    "Visual Communication Laboratory at IBM": "United States",
    "IDEA": "United States",
    "IDEA.org": "United States",
    "IEEE Spectrum": "United States",
    "Independent": "United States",
     "University of Delaware": "United States",
    "Indiana University": "United States",
    "Intel": "United States",
    "Intelligent Light": "United States",
    "Infovisible LLC": "United States",
    "Iowa State University": "United States",
    "Statistics at Iowa State University": "United States",
    "Johns Hopkins University": "United States",
    "Kitware, Inc.": "United States",
    "Kent State University": "United States",
    "Kohn Pedersen Fox Associates PC": "United States",
    "Lawrence Livermore National Laboratory": "United States",
    "Lawrence Berkeley National Laboratory (LBNL)": "United States",
    "Berkeley National Laboratory": "United States",
    "University of California Berkeley": "United States",
    "Univ. of California": "United States",
    "UC Santa Barbara": "United States",
    "LBNL": "United States",
    "LLNL": "United States",
    "Looking Glass HF, Inc.": "United States",
    "Los Alamos National Laboratory": "United States",
    "Maine Medical Center": "United States",
    "Maine Medical Center and Tufts Medical School": "United States",
    "Massachusetts Institute of Technology": "United States",
    "MERL": "United States",
    "Microsoft Corporation": "United States",
    "Microsoft Corp": "United States",
    "Honeycomb.io": "United States",
    "Microsoft Research": "United States",
    "Minneapolis College of Art and Design": "United States",
    "Mississippi State University": "United States",
    "MIT": "United States",
    "Massachusetts Institute of Technology (MIT)": "United States",
    "Mitsubishi Electric Research Laboratories": "United States",
    "NASA Ames Research Center": "United States",
    "NASA Goddard Space Flight Center": "United States",
    "NASA Langley Research Center": "United States",
    "New Jersey Institute of Technology": "United States",
    "New York University": "United States",
    "NC State University": "United States",
    "The New York Times": "United States",
    "NVIDIA": "United States",
    "Northeastern University": "United States",
    "Northwestern University": "United States",
    "NYU": "United States",
    "NYU Polytechnic School of Engineering": "United States",
    "Office of Research and Development, U.S. Environmental Protection Agency": "United States",
    "Office of Research and Development": "United States",
    "Ohio Supercomputer Center": "United States",
    "Oculus Info": "United States",
    "Oculus Info, Inc.": "United States",
    "Oregon State University": "United States",
    "Oak Ridge National Laboratory": "United States",
    "Pacific Data Images (PDI)": "United States",
    "Pacific Northwest National Lab": "United States",
    "Pacific Northwest National Laboratory": "United States",
    "Palo Alto Research Center (PARC)": "United States",
    "Xerox Palo Alto Research Center": "United States",
    "AT&T Research": "United States",
    "Princeton": "United States",
    "Purdue U.": "United States",
    "Purdue University": "United States",
    "Roy Family Homeschool": "United States",
    "Sandia National Laboratories": "United States",
    "San Diego Supercomputer Center": "United States",
    "Secure Decisions": "United States",
    "SRI International": "United States",
    "SSS Research, Inc.": "United States",
    "Stanford": "United States",
    "University of Stanford":  "United States",
    "Stanford University": "United States",
    "Stony Brook University": "United States",
    "State University of New York at Stony Brook": "United States",
    "SPADAC, Inc.": "United States",
    "Tableau Research": "United States",
    "Tableau Software, Inc.": "United States",
    "Technology Applications, Inc.": "United States",
    "The Discovery Analytics Center": "United States",
    "The Ohio State University": "United States",
    "Ohio State University": "United States",
    "The Pennsylvania State University": "United States",
    "The Scripps Research Institute": "United States",
    "The University of New Hampshire": "United States",
    "The University of North Carolina,": "United States",
    "North Carolina State University": "United States",
    "University of North Carolina at Asheville": "United States",
    "University of North Carolina at Chapel Hill": "United States",
    "University of North Carolina at Charlotte": "United States",
    "The University of Oklahoma": "United States",
    "Tufts U": "United States",
    "Tufts University": "United States",
    "Twitter Inc.": "United States",
    "Twitter, Inc.": "United States",
    "U.S. Geological Survey": "United States",
    "U.N.C. Charlotte": "United States",
    "UNC-Charlotte": "United States",
    'UNC Charlotte': "United States",
    "UC Davis": "United States",
    "UCLA School of Medicine": "United States",

    "Uber": "United States",
    "UMass Dartmouth": "United States",
    "University of Alabama Huntsville": "United States",
    "University of Alabama in Huntsville": "United States",
    "University of Arizona": "United States",
    "University of California": "United States",
    "University of Chicago": "United States",
    "University of Colorado": "United States",
    "University of Colorado Boulder": "United States",
    "University of Florida": "United States",
    "University of Houston": "United States",
    "University of Illinois": "United States",
    "University of Louisville": "United States",
    "University of Maryland": "United States",
    "University of Maryland Baltimore County": "United States",
    "University of Massachusetts": "United States",
    "University of Michigan": "United States",
    "University of Minnesota": "United States",
    "University of Minnesota Computer Scientist": "United States",
    "University of New Hampshire": "United States",
    "University of North Carolina": "United States",
    "University of Notre Dame": "United States",
    "University of Oklahoma": "United States",
    "University of Pittsburgh": "United States",
    "University of South Carolina": "United States",
    "University of South Florida": "United States",
    "University of Southern California": "United States",
    "University of Texas": "United States",
    "Texas A&M University": "United States",
    "University of Utah": "United States",
    "University of Virginia": "United States",
    "University of Washington": "United States",
    "University of Wisconsin": "United States",
    "University of Wisconsin-Madison": "United States",
    "University-Purdue University": "United States",
    "Vanderbilt University": "United States",
    "Vanderbilt University School of Medicine": "United States",
    "VIDi": "United States",
    "Visa Research": "United States",
    "Vision Systems and Technology, Inc.": "United States",
    "Virginia Tech": "United States",
    "Visintuit LLC": "United States",
    "Washington University": "United States",
    "Wayne State University": "United States",
    "Worcester Polytechnic Institute": "United States",
    "Yale": "United States",
    "IBM Scientific Center": "United States",
    "IBM T.J": "United States",

    # -------- Vietnam --------
    "Da Nang": "Vietnam",
    "Duy Tan University": "Vietnam",
    "Hanoi": "Vietnam",
    "Hanoi University of Science and Technology": "Vietnam",
    "HUST": "Vietnam",
    "Ho Chi Minh City": "Vietnam",
    "Ho Chi Minh City University of Technology": "Vietnam",
    "HCMUT": "Vietnam",
    "Ton Duc Thang University": "Vietnam",
    "TDTU": "Vietnam",
    "Vietnam Academy of Science and Technology": "Vietnam",
    "VAST": "Vietnam",
    "Vietnam National University Hanoi": "Vietnam",
    "Vietnam National University, Hanoi": "Vietnam",
    "Vietnam National University - Hanoi": "Vietnam",
    "VNU Hanoi": "Vietnam",
    "Vietnam National University Ho Chi Minh City": "Vietnam",
    "Vietnam National University, Ho Chi Minh City": "Vietnam",
    "VNU-HCM": "Vietnam",
}

# Alphabetical insertion order by key (case-insensitive)
KEYWORD_MAP = dict(sorted(KEYWORD_MAP_RAW.items(), key=lambda kv: kv[0].casefold()))
def _normalize_affiliation_text(s: str) -> str:
    if s is None:
        return ""
    s = str(s).strip()
    if len(s) >= 2 and ((s[0] == s[-1] == '"') or (s[0] == s[-1] == "'")):
        s = s[1:-1].strip()
    s = s.replace('""', '')
    s = s.replace('"', '')
    return s.strip()


def _contains_token(text: str, token: str) -> bool:
    if not token:
        return False
    t = text
    # short all-caps token: case sensitive (US, UK, IN, etc.)
    if len(token) <= 3 and token.isupper():
        pattern = r"(?<!\w)" + re.escape(token) + r"(?!\w)"
        return re.search(pattern, t) is not None
    pattern = r"(?<!\w)" + re.escape(token) + r"(?!\w)"
    return re.search(pattern, t, flags=re.IGNORECASE) is not None


def _is_us_context(text: str) -> bool:
    """Detect if affiliation chunk looks US-based."""
    return (
        US_MARKER_RE.search(text) is not None
        or US_STATE_ZIP_RE.search(text) is not None
        or US_STATE_CONTEXT_RE.search(text) is not None
    )


def _extract_countries_from_chunk(chunk: str):
    """
    Extract countries from ONE author chunk (one segment between ';').
    Returns list of countries in insertion order (no duplicates).
    """
    if not isinstance(chunk, str) or not chunk.strip():
        return []

    text_for_match = _normalize_affiliation_text(chunk)
    found = []

    has_us = _is_us_context(text_for_match)
    has_att = ATT_RE.search(text_for_match) is not None

    # 1) standard map scan
    for key, val in COUNTRY_MAP.items():

        # If US context: skip state codes (DE, IL, AR, ID, etc.)
        if has_us and key in US_STATE_CODES:
            continue

        # AT inside AT&T should not count as Austria
        if key == "AT" and has_att:
            continue

        if _contains_token(text_for_match, key):
            if val not in found:
                found.append(val)

    # 2) keyword scan only if nothing found
    if not found:
        lowered = text_for_match.lower()
        for k, v in KEYWORD_MAP.items():
            if k.lower() in lowered and v not in found:
                found.append(v)

    # OPTIONAL: Prefer Hong Kong over China for patterns "... Hong Kong ..., China"
    if "Hong Kong" in found and "China" in found:
        if re.search(r"Hong\s*Kong.*\bChina\b", text_for_match, flags=re.IGNORECASE):
            found = [c for c in found if c != "China"]

    return found


def get_country_per_author(affiliation_string: str):
    """
    Keep author separation by ';'
    Output example: "Australia, France ; France ; Canada"
    Preserves chunk positions (writes 'None' if chunk unresolved).
    """
    if not isinstance(affiliation_string, str) or not affiliation_string.strip():
        return None

    text = _normalize_affiliation_text(affiliation_string)

    # keep empty slots (important for alignment)
    raw_chunks = text.split(";")

    parts = []
    for ch in raw_chunks:
        ch = ch.strip()
        if not ch:
            parts.append("None")
            continue

        countries = _extract_countries_from_chunk(ch)
        parts.append(", ".join(countries) if countries else "None")

    if all(p == "None" for p in parts):
        return None

    return " ; ".join(parts)


if __name__ == "__main__":
    file_path = "../dataset_original/dataset.csv"
    out_file = "../outputs/country_outputs/dataset_with_countries.csv"
    missing_file = "../outputs/country_outputs/missing_affiliations.csv"

    df = pd.read_csv(file_path)

    # Drop junk affiliations
    JUNK_AFFILIATIONS = {";", ";;;;", ";;;;;", ";;;;;;;", ";;;;;;;;;;;"}
    affil_raw = df["AuthorAffiliation"].fillna("").astype(str)
    affil_clean = affil_raw.map(_normalize_affiliation_text)
    junk_mask = affil_clean.isin(JUNK_AFFILIATIONS) | (affil_clean.str.strip() == "")
    df = df.loc[~junk_mask].copy()

    # Apply extraction (per author)
    df["Country_Extracted"] = df["AuthorAffiliation"].map(get_country_per_author)

    # Save full dataset
    df.to_csv(out_file, index=False)
    print(f"Saved: {out_file}")

    # Save missing affiliations report
    missing_df = df[df["Country_Extracted"].isna()]
    unique_missing = missing_df["AuthorAffiliation"].dropna().unique()
    pd.DataFrame(unique_missing, columns=["Missing_Affiliation_String"]).to_csv(missing_file, index=False)

    print(f"Missing rows: {len(missing_df)}")
    print(f"Unique missing affiliations saved: {missing_file}")