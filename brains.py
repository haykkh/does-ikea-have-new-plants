from app import db, Database
from models import Plant
from datetime import date
import requests

def planter(p: dict, db: Database) -> str:
    """ Initializes plant object and adds to db. 
        If plant ID already exists in db,  raises exception and rolls db back.

        Args: 
            p:  dictionary of plant data from IKEA api
            db: psql database containing plant data

        Returns:
            Confirmation of plant added with plant id for success
            Exception otherwise
    """
    try:
        plant = Plant(
            id = p['id'],
            name = p['name'],
            price = p['price'],
            date = date.today(),
            url = p['pip_url'],
            image = p['main_image_url']
        )
        db.session.add(plant)
        db.session.commit()
        return f"Plant added. plant id={plant.id}"

    except Exception as e:
        db.session.rollback()
        return(str(e))


def find_the_plants(ikea: str, db: Database) -> None:
    """ Does IKEA API call, getting a list of dictionaries 
        of all their plants with respective data.
        Iterates through list, trying to add each plant to the db.

        Args:
            ikea: URL for IKEA API call
            db:   psql database containing plant data

        Returns:
            None
    """

    forest = requests.get(ikea).json()['productList'][0]['products']

    for plant in forest:
        planter(plant['attributes'], db)

    return None
        

def update_today() -> bool:
    """ Checks if IKEA has released a new plant today
    """
    most_recent = Plant.query.order_by(Plant.date.desc()).first()

    return most_recent.date == date.today()