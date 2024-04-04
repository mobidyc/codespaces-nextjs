import glob
import os
import json

save_dir = "resources/save_dir"
merged_file = "resources/merged.json"

# Get a list of all JSON files in the save_dir directory
json_files = glob.glob(os.path.join(save_dir, "*.json"))

merged_data = []

# Iterate over each JSON file and process it
for json_file in json_files:
    with open(json_file, "r") as file:
        data = json.load(file)
        data["text"] = data["text"].strip("\n").strip()
        data["content"] = data.pop("text")
        merged_data.append(data)

# Write the merged data to a new JSON file
with open(merged_file, "w") as file:
    json.dump(merged_data, file, indent=4)

print("Merged data written to:", merged_file)
