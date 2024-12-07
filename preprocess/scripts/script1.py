import pandas as pd
data = pd.read_csv('../data/raw_data0/mortality_rate.csv')

data["mortality_rate"] = data["Age-standardized deaths from maternal conditions in both sexes per 100,000 people"]
data["country"] = data["Entity"]
data["year"] = data["Year"]

data = data[["mortality_rate", "country", "year"]]
data.to_csv("../data/clean/data1.csv")