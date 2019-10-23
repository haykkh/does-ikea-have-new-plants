from app import db

class Plant(db.Model):
    __tablename__ = 'plants'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    price = db.Column(db.String())
    date = db.Column(db.Date())
    image = db.Column(db.String())

    def __init__(self, id, name, price, date, image):
        self.id = id
        self.name = name
        self.price = price
        self.date = date
        self.image = image

    def __repr__(self):
        return f'<id {self.id}>'


    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'date': self.date,
            'image': self.image
        }