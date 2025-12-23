import pandas as pd
import re

def get_country_improved(affiliation_string):
    if not isinstance(affiliation_string, str):
        return None

    # 1. Standard Country Map (Official & Abbreviations)
    country_map = {
        'USA': 'United States', 'US': 'United States', 'United States': 'United States',
        'UK': 'United Kingdom', 'United Kingdom': 'United Kingdom', 'Great Britain': 'United Kingdom',
        'Germany': 'Germany', 'DE': 'Germany', 'Deutschland': 'Germany',
        'China': 'China', 'CN': 'China', 'PRC': 'China',
        'Canada': 'Canada', 'CA': 'Canada',
        'France': 'France', 'FR': 'France',
        'Japan': 'Japan', 'JP': 'Japan',
        'Australia': 'Australia', 'AU': 'Australia',
        'Netherlands': 'Netherlands', 'The Netherlands': 'Netherlands', 'NL': 'Netherlands',
        'Italy': 'Italy', 'IT': 'Italy',
        'Spain': 'Spain', 'ES': 'Spain',
        'Switzerland': 'Switzerland', 'CH': 'Switzerland',
        'Sweden': 'Sweden', 'SE': 'Sweden',
        'South Korea': 'South Korea', 'Korea': 'South Korea', 'KR': 'South Korea',
        'Taiwan': 'Taiwan', 'TW': 'Taiwan',
        'Brazil': 'Brazil', 'BR': 'Brazil',
        'India': 'India', 'IN': 'India',
        'Austria': 'Austria', 'AT': 'Austria',
        'Denmark': 'Denmark', 'DK': 'Denmark',
        'Belgium': 'Belgium', 'BE': 'Belgium',
        'Finland': 'Finland', 'FI': 'Finland',
        'Singapore': 'Singapore', 'SG': 'Singapore',
        'Hong Kong': 'Hong Kong', 'HK': 'Hong Kong',
        'Norway': 'Norway', 'NO': 'Norway',
        'Russia': 'Russia', 'RU': 'Russia',
        'Israel': 'Israel', 'IL': 'Israel',
        'Portugal': 'Portugal', 'PT': 'Portugal',
        'Greece': 'Greece', 'GR': 'Greece',
        'Czech Republic': 'Czech Republic', 'CZ': 'Czech Republic',
        'Ireland': 'Ireland', 'IE': 'Ireland',
        'New Zealand': 'New Zealand', 'NZ': 'New Zealand',
        'Saudi Arabia': 'Saudi Arabia',
        'Turkey': 'Turkey',
        'Poland': 'Poland',
        'Hungary': 'Hungary',
        'Slovenia': 'Slovenia',
        'Chile': 'Chile',
        'Argentina': 'Argentina'
    }

    # 2. Institution / City / State inference map (for cases where Country is missing)
    # Based on the most frequent missing terms in your dataset
    keyword_map = {
        # USA Universities & Labs
        'Stanford': 'United States',
        'MIT': 'United States', 'Massachusetts Institute of Technology': 'United States',
        'Harvard': 'United States',
        'Carnegie Mellon': 'United States', 'CMU': 'United States',
        'Berkeley': 'United States',
        'Princeton': 'United States',
        'Yale': 'United States',
        'Columbia University': 'United States',
        'Cornell': 'United States',
        'Georgia Tech': 'United States', 'Georgia Institute of Technology': 'United States',
        'University of Washington': 'United States',
        'University of Utah': 'United States',
        'New York University': 'United States', 'NYU': 'United States',
        'University of California': 'United States', 'UC Davis': 'United States', 'Davis': 'United States',
        'Purdue': 'United States',
        'Ohio State': 'United States',
        'Arizona': 'United States',
        'Maryland': 'United States',
        'Michigan': 'United States',
        'Illinois': 'United States',
        'Texas': 'United States',
        'Virginia': 'United States',
        'North Carolina': 'United States',
        'Penn State': 'United States',
        'Argonne': 'United States',
        'Lawrence Livermore': 'United States',
        'Tableau': 'United States', # Tableau Research
        'Microsoft Research': 'United States', # Default, though they have global offices
        'Google': 'United States',
        'IBM': 'United States',
        'Adobe': 'United States',
        'AT&T': 'United States',
        
        # Europe
        'Stuttgart': 'Germany',
        'Konstanz': 'Germany',
        'Munich': 'Germany', 'München': 'Germany',
        'Berlin': 'Germany',
        'Heidelberg': 'Germany',
        'Saarland': 'Germany',
        'Tübingen': 'Germany',
        'Max Planck': 'Germany',
        'Fraunhofer': 'Germany',
        'Karlsruhe': 'Germany',
        'Aachen': 'Germany',
        'Darmstadt': 'Germany',
        
        'Paris': 'France',
        'Toulouse': 'France',
        'Grenoble': 'France',
        'INRIA': 'France',
        'CNRS': 'France',
        
        'Zurich': 'Switzerland', 'Zürich': 'Switzerland',
        'ETH': 'Switzerland',
        'EPFL': 'Switzerland',
        'Lausanne': 'Switzerland',
        
        'Vienna': 'Austria', 'Wien': 'Austria',
        'Graz': 'Austria',
        'Linz': 'Austria',
        
        'Eindhoven': 'Netherlands',
        'Delft': 'Netherlands',
        'Utrecht': 'Netherlands',
        'Amsterdam': 'Netherlands',
        
        'Cambridge': 'United Kingdom', # Could be USA, but usually UK in this context if just "Cambridge"
        'Oxford': 'United Kingdom',
        'London': 'United Kingdom',
        'Edinburgh': 'United Kingdom',
        
        # Asia
        'Tsinghua': 'China',
        'Peking': 'China',
        'Zhejiang': 'China',
        'Fudan': 'China',
        'Shanghai': 'China',
        'Beijing': 'China',
        'Shenzhen': 'China',
        'Hunan': 'China',
        
        'Tokyo': 'Japan',
        'Kyoto': 'Japan',
        'Osaka': 'Japan',
        'Tsukuba': 'Japan',
        
        'Seoul': 'South Korea',
        'KAIST': 'South Korea',
        'Yonsei': 'South Korea',
        'POSTECH': 'South Korea',
        
        'National University of Singapore': 'Singapore',
        'Nanyang': 'Singapore',
        
        # Australia / Canada
        'Monash': 'Australia',
        'Melbourne': 'Australia',
        'Sydney': 'Australia',
        
        'Toronto': 'Canada',
        'British Columbia': 'Canada', 'UBC': 'Canada',
        'Vancouver': 'Canada',
        'Montreal': 'Canada',
        'McGill': 'Canada',
        'Calgary': 'Canada',
        'Waterloo': 'Canada'
    }

    found_countries = set()
    
    # Pre-cleaning
    text = affiliation_string.replace(';', ',') 
    
    # 1. Check for standard country names first (Higher Priority)
    for key, val in country_map.items():
        # Check as a distinct word or at end of string to avoid false positives (e.g., "US" in "Use")
        # Regex look for word boundary
        if re.search(r'\b' + re.escape(key) + r'\b', text, re.IGNORECASE):
            found_countries.add(val)
            
    # 2. If no country found, or to augment, check for Institutions/Cities
    if not found_countries:
        for key, val in keyword_map.items():
            if key.lower() in text.lower():
                found_countries.add(val)
                
    if found_countries:
        return ", ".join(sorted(list(found_countries)))
    return None

# --- Main Execution ---
if __name__ == "__main__":
    file_path = 'dataset.csv'
    try:
        df = pd.read_csv(file_path)
        print("Dataset loaded.")
        
        df['Country_Extracted'] = df['AuthorAffiliation'].apply(get_country_improved)
        
        # Check stats
        total = len(df)
        found = df['Country_Extracted'].notna().sum()
        missing = total - found
        print(f"Countries extracted: {found} / {total}")
        print(f"Still missing: {missing}")
        
        # Save
        df.to_csv('dataset_with_countries_improved.csv', index=False)
        print("Saved to 'dataset_with_countries_improved.csv'")
        
        # Optional: Print remaining missing to see what's left
        if missing > 0:
            print("\nSample of remaining missing affiliations:")
            print(df[df['Country_Extracted'].isna()]['AuthorAffiliation'].unique()[:10])
            
    except FileNotFoundError:
        print("dataset.csv not found.")