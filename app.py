from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
from typing import NewType
import os

app = Flask(__name__)

app.config.from_object(os.environ.get('APP_SETTINGS'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

Database = NewType('SQL', SQLAlchemy) 

from models import Plant
from brains import find_the_plants, update_today

@app.route('/')
def index():
    find_the_plants("https://w53515517.api.esales.apptus.cloud/api/v1/panels/category-products-color/category-products/product-list?market=GBEN&arg.market=GBEN&arg.selected_category=category_catalog_gben:%2710779%27&arg.window_first=1&arg.window_last=1000", db)

    return render_template(
        "index.html",
        update = update_today(),
        plants = [(plant.name, plant.url) for plant in Plant.query.limit(10)]
    )

if __name__ == '__main__':
    app.run()