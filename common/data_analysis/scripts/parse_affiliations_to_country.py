import pandas as pd
import re


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
    "CA": "Canada",
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
    "DE": "Germany",
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
    "ID": "Indonesia",
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
    "IL": "Israel",
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

    # Turkey
    "TR": "Turkey",
    "Turkey": "Turkey",

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
    "The University of Queensland": "Australia",
    "University of Melbourne": "Australia",
    "University of Sydney": "Australia",

    # -------- Austria --------
    "Graz": "Austria",
    "Kapsch TrafficCom AG": "Austria",
    "TU Wien": "Austria",
    "Vienna": "Austria",
    "VRVis": "Austria",
    "VRVis Research Center": "Austria",

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
    "Universidade Federal Fluminense": "Brazil",
    "University of Campinas": "Brazil",
    "University of São Paulo": "Brazil",

    # -------- Canada --------
    "An Independent Researcher": "Canada",
    "British Columbia": "Canada",
    "Dalhousie University": "Canada",
    "IRI": "Canada",
    "Ontario Tech University": "Canada",
    "Simon Fraser University": "Canada",
    "Toronto": "Canada",
    "Université Laval": "Canada",
    "University of Calgary": "Canada",
    "University of Manitoba": "Canada",
    "University of Ontario Institute of Technology": "Canada",
    "University of Victoria": "Canada",
    "Vancouver": "Canada",
    "OCAD University": "Canada",
    "OCADU": "Canada",

    # -------- Chile --------
    "Pontificia Universidad Católica de Chile": "Chile",
    "University of Chile": "Chile",

    # -------- China --------
    "Chinese Academy of Sciences": "China",
    "Peking": "China",
    "Shanghai Jiao Tong University": "China",
    "Shenzhen Institutes of Advanced Technology": "China",
    "Shenzhen University": "China",
    "Sichuan University": "China",
    "Tianjin University": "China",
    "Tongji University": "China",
    "Tsinghua": "China",
    "Xi'an Jiaotong University": "China",
    "Zhejiang": "China",

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

    # -------- France --------
    "CNRS": "France",
    "ENAC": "France",
    "INRIA": "France",
    "Paris": "France",
    "Sorbonne University": "France",

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
    "Leipzig University": "Germany",
    "Macrofocus GmbH": "Germany",
    "Max Planck Institute for Evolutionary Biology": "Germany",
    "Max Planck Institute for Informatics": "Germany",
    "Munich": "Germany",
    "Potsdam University of Applied Sciences": "Germany",
    "Robert Bosch Research": "Germany",
    "Robert Bosch Research and Technology Center": "Germany",
    "Saarland University": "Germany",
    "Stuttgart": "Germany",
    "TU Dresden": "Germany",
    "TU Kaiserslautern": "Germany",
    "Technische Universitat Dresden": "Germany",
    "Technische Universität München": "Germany",
    "Technische Universität Műnchen": "Germany",
    "Technical University of Munich": "Germany",
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
    "Technion": "Israel",
    "The Hebrew University of Jerusalem": "Israel",
    "University of Haifa": "Israel",

    # -------- Italy --------
    'La Sapienza University of Rome': "Italy",
    'Sapienza University of Rome': "Italy",
    'University of Rome "La Sapienza"': "Italy",
    'University of Rome ""La Sapienza""': "Italy",
    "Politecnico di Milano": "Italy",
    "University of Bologna": "Italy",

    # -------- Japan --------
    "Kyoto": "Japan",
    "Tokyo": "Japan",
    "University of Tokyo": "Japan",
    "The University of Tokyo": "Japan",

    # -------- Malaysia --------
    "Multimedia University": "Malaysia",
    "MMU": "Malaysia",
    "Universiti Kebangsaan Malaysia": "Malaysia",
    "UKM": "Malaysia",
    "Universiti Malaya": "Malaysia",
    "University of Malaya": "Malaysia",
    "UM": "Malaysia",
    "Universiti Putra Malaysia": "Malaysia",
    "UPM": "Malaysia",
    "Universiti Sains Malaysia": "Malaysia",
    "USM": "Malaysia",
    "Universiti Teknologi Malaysia": "Malaysia",
    "UTM": "Malaysia",

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
    "ITU": "Turkey",
    "Middle East Technical University": "Turkey",
    "METU": "Turkey",

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
    "Middlesex University": "United Kingdom",
    "Oxford": "United Kingdom",
    "Swansea University": "United Kingdom",
    "University of Bristol": "United Kingdom",
    "University of Chester": "United Kingdom",
    "University of East Anglia": "United Kingdom",
    "University of Lincoln": "United Kingdom",

    # -------- United States (labs/companies) --------
    "Air Force Research Laboratory": "United States",
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
    "H2O.ai, UIC": "United States",
    "IBM": "United States",
    "IDEA": "United States",
    "IDEA.org": "United States",
    "IEEE Spectrum": "United States",
    "Independent": "United States",
    "Indiana University": "United States",
    "Intel": "United States",
    "Intelligent Light": "United States",
    "Johns Hopkins University": "United States",
    "Kitware, Inc.": "United States",
    "Kohn Pedersen Fox Associates PC": "United States",
    "Lawrence Livermore National Laboratory": "United States",
    "Lawrence Berkeley National Laboratory (LBNL)": "United States",
    "LBNL": "United States",
    "LLNL": "United States",
    "Looking Glass HF, Inc.": "United States",
    "Los Alamos National Laboratory": "United States",
    "Maine Medical Center": "United States",
    "Maine Medical Center and Tufts Medical School": "United States",
    "Massachusetts Institute of Technology": "United States",
    "MERL": "United States",
    "Microsoft Corporation": "United States",
    "Microsoft Research": "United States",
    "Minneapolis College of Art and Design": "United States",
    "Mississippi State University": "United States",
    "MIT": "United States",
    "Mitsubishi Electric Research Laboratories": "United States",
    "NASA Ames Research Center": "United States",
    "NASA Goddard Space Flight Center": "United States",
    "NASA Langley Research Center": "United States",
    "New Jersey Institute of Technology": "United States",
    "New York University": "United States",
    "NC State University": "United States",
    "NVIDIA": "United States",
    "Northeastern University": "United States",
    "Northwestern University": "United States",
    "NYU": "United States",
    "Office of Research and Development, U.S. Environmental Protection Agency": "United States",
    "Ohio Supercomputer Center": "United States",
    "Oculus Info": "United States",
    "Oculus Info, Inc.": "United States",
    "Oregon State University": "United States",
    "Pacific Data Images (PDI)": "United States",
    "Pacific Northwest National Lab": "United States",
    "Pacific Northwest National Laboratory": "United States",
    "Palo Alto Research Center (PARC)": "United States",
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
    "Stony Brook University": "United States",
    "State University of New York at Stony Brook": "United States",
    "SPADAC, Inc.": "United States",
    "Tableau Research": "United States",
    "Technology Applications, Inc.": "United States",
    "The Discovery Analytics Center": "United States",
    "The Ohio State University": "United States",
    "Ohio State University": "United States",
    "The Pennsylvania State University": "United States",
    "The Scripps Research Institute": "United States",
    "The University of New Hampshire": "United States",
    "The University of North Carolina,": "United States",
    "North Carolina State University": "United States",
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


def _contains_token(text: str, token: str) -> bool:
    """
    Token match with boundaries.
    - If token is short (<=3) and all-caps (e.g. US, UK, IN), match case-sensitively to avoid false positives.
    - Otherwise match case-insensitively.
    """
    if not token:
        return False

    # Normalize text a bit to reduce punctuation edge cases
    t = text

    # For short all-caps tokens (codes), be case-sensitive
    if len(token) <= 3 and token.isupper():
        pattern = r"(?<!\w)" + re.escape(token) + r"(?!\w)"
        return re.search(pattern, t) is not None

    # For other tokens, be case-insensitive and boundary-aware
    pattern = r"(?<!\w)" + re.escape(token) + r"(?!\w)"
    return re.search(pattern, t, flags=re.IGNORECASE) is not None


def get_country_improved(affiliation_string):
    if not isinstance(affiliation_string, str) or not affiliation_string.strip():
        return None

    text = affiliation_string.replace(";", ",")
    found_countries = set()

    # 1) Standard map scan
    for key, val in COUNTRY_MAP.items():
        if _contains_token(text, key):
            found_countries.add(val)

    # 2) Keyword/inference scan (only if nothing found yet)
    if not found_countries:
        lowered = text.lower()
        for key, val in KEYWORD_MAP.items():
            if key.lower() in lowered:
                found_countries.add(val)

    if found_countries:
        return ", ".join(sorted(found_countries))
    return None


if __name__ == "__main__":
    file_path = "../dataset_original/dataset.csv"
    try:
        print(f"Loading {file_path}...")
        df = pd.read_csv(file_path)

        # Apply extraction
        df["Country_Extracted"] = df["AuthorAffiliation"].apply(get_country_improved)

        # 1) Save the main dataset with results
        df.to_csv("../outputs/country_outputs/dataset_with_countries.csv", index=False)
        print("Success! Full dataset saved to 'dataset_with_countries.csv'")

        # 2) Filter and save missing affiliations
        missing_df = df[df["Country_Extracted"].isna()]
        unique_missing = missing_df["AuthorAffiliation"].dropna().unique()

        missing_output = pd.DataFrame(unique_missing, columns=["Missing_Affiliation_String"])
        missing_file = "../outputs/country_outputs/missing_affiliations.csv"
        missing_output.to_csv(missing_file, index=False)

        print(f"Report: {len(missing_df)} rows failed country extraction.")
        print(f"Unique missing affiliation strings saved to '{missing_file}' for review.")

    except FileNotFoundError:
        print("Error: dataset.csv not found.")
