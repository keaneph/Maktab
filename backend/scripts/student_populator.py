import csv
import random
from datetime import datetime

# Settings
num_records = 300
output_file = "students.csv"

# Sample data
firstnames = [
    "John", "Jane", "Alex", "Chris", "Pat", "Sam", "Taylor", "Jordan", "Casey", "Drew",
    "Jamie", "Morgan", "Aiden", "Liam", "Noah", "Emma", "Olivia", "Sophia", "Mia", "Lucas"
]
lastnames = [
    "Smith", "Johnson", "Garcia", "Lee", "Martinez", "Brown", "Davis", "Lopez", "Miller", "Wilson",
    "Anderson", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Harris", "Clark"
]
courses = ["BSCS", "BSIT", "BSIS", "BSECE", "BSMETE", "BSPSYCH", "BSPHILO", "BSMATH", "BSEE", "BSBA", "BSHM", "BSMICROBIO", "BSCE", "BSBIO", "BSA", "BSCPE", "BSIAM", "BSECET", "BAFIL"]
years = [1, 2, 3, 4]
genders = ["Male", "Female"]

# Current date
datecreated = "10/15/2025"
addedby = "admin"

with open(output_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["idno", "firstname", "lastname", "course", "year", "gender", "datecreated", "addedby"])
    
    for i in range(1, num_records + 1):
        idno = f"2023-{i:04d}"
        firstname = random.choice(firstnames)
        lastname = random.choice(lastnames)
        course = random.choice(courses)
        year = random.choice(years)
        gender = random.choice(genders)
        
        writer.writerow([idno, firstname, lastname, course, year, gender, datecreated, addedby])

print(f"✅ Generated {num_records} records in {output_file}")
