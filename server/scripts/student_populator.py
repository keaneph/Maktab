import random

# Settings
num_records = 300
output_file = "students.sql"

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

with open(output_file, mode="w", encoding="utf-8") as file:
    for i in range(1, num_records + 1):
        idNo = f"2025-{i:04d}"
        firstName = random.choice(firstnames)
        lastName = random.choice(lastnames)
        course = random.choice(courses)
        year = random.choice(years)
        gender = random.choice(genders)
        
        sql = f'INSERT INTO public.students ("idNo", "firstName", "lastName", "course", "year", "gender", "created_at", "photo_path")\n'
        sql += f"VALUES ('{idNo}', '{firstName}', '{lastName}', '{course}', {year}, '{gender}', DEFAULT, '');\n\n"
        
        file.write(sql)

print(f"Generated {num_records} SQL INSERT statements in {output_file}")
