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

    # 2. Institution / City / State inference map
    keyword_map = {
        'Stanford': 'United States', 'MIT': 'United States', 
        'Harvard': 'United States', 'Carnegie Mellon': 'United States',
        'Berkeley': 'United States', 'Princeton': 'United States',
        'Yale': 'United States', 'Columbia University': 'United States',
        'Georgia Tech': 'United States', 'University of Washington': 'United States',
        'University of Utah': 'United States', 'NYU': 'United States',
        'University of California': 'United States', 'UC Davis': 'United States',
        'Microsoft Research': 'United States', 'Google': 'United States',
        'IBM': 'United States', 'Adobe': 'United States',
        
        'Stuttgart': 'Germany', 'Konstanz': 'Germany', 'Munich': 'Germany',
        'Berlin': 'Germany', 'Heidelberg': 'Germany', 'Fraunhofer': 'Germany',
        
        'Paris': 'France', 'INRIA': 'France', 'CNRS': 'France',
        'Zurich': 'Switzerland', 'ETH': 'Switzerland',
        'Vienna': 'Austria', 'Graz': 'Austria',
        'Eindhoven': 'Netherlands', 'Delft': 'Netherlands',
        'Cambridge': 'United Kingdom', 'Oxford': 'United Kingdom', 'London': 'United Kingdom',
        'Tsinghua': 'China', 'Peking': 'China', 'Zhejiang': 'China',
        'Tokyo': 'Japan', 'Kyoto': 'Japan',
        'Seoul': 'South Korea', 'KAIST': 'South Korea',
        'Toronto': 'Canada', 'British Columbia': 'Canada', 'Vancouver': 'Canada',
        'Monash': 'Australia', 'Melbourne': 'Australia'
    }

    found_countries = set()
    text = affiliation_string.replace(';', ',') 
    
    # Check standard map
    for key, val in country_map.items():
        if re.search(r'\b' + re.escape(key) + r'\b', text, re.IGNORECASE):
            found_countries.add(val)
            
    # Check keyword map
    if not found_countries:
        for key, val in keyword_map.items():
            if key.lower() in text.lower():
                found_countries.add(val)
                
    if found_countries:
        return ", ".join(sorted(list(found_countries)))
    return None

if __name__ == "__main__":
    file_path = 'dataset.csv'
    try:
        print(f"Loading {file_path}...")
        df = pd.read_csv(file_path)
        
        # Apply extraction
        df['Country_Extracted'] = df['AuthorAffiliation'].apply(get_country_improved)
        
        # 1. Save the main dataset with results
        df.to_csv('dataset_with_countries.csv', index=False)
        print("Success! Full dataset saved to 'dataset_with_countries.csv'")
        
        # 2. Filter and save missing affiliations
        # We get rows where Country_Extracted is NULL
        missing_df = df[df['Country_Extracted'].isna()]
        
        # We extract just the unique affiliation strings to avoid duplicates in the report
        unique_missing = missing_df['AuthorAffiliation'].unique()
        
        # Create a DataFrame for the missing list
        missing_output = pd.DataFrame(unique_missing, columns=['Missing_Affiliation_String'])
        
        missing_file = 'missing_affiliations.csv'
        missing_output.to_csv(missing_file, index=False)
        
        print(f"Report: {len(missing_df)} rows failed country extraction.")
        print(f"Unique missing affiliation strings saved to '{missing_file}' for review.")

    except FileNotFoundError:
        print("Error: dataset.csv not found.")