from sqlalchemy.orm import validates
from marshmallow import Schema, fields, validate
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import date

from config import db, bcrypt