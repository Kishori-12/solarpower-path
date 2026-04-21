class SolarCalculation:
    def __init__(self, roof_area, location, monthly_bill):
        self.roof_area = roof_area
        self.location = location
        self.monthly_bill = monthly_bill

    def to_dict(self):
        return {
            "roof_area": self.roof_area,
            "location": self.location,
            "monthly_bill": self.monthly_bill
        }


class UserData:
    def __init__(self, name, email, phone, address):
        self.name = name
        self.email = email
        self.phone = phone
        self.address = address

    def to_dict(self):
        return {
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address
        }
