import os
import sys
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
import os
from urllib import parse

PG_URL = parse.urlparse(os.environ["DATABASE_URL"])

PG_DATABASE = PG_URL.path[1:]
# PG_DATABASE = 'p2e';
PG_USER = PG_URL.username
PG_PASSWD = PG_URL.password
PG_HOST = PG_URL.hostname
PG_PORT = str(PG_URL.port)
PG_CONN = 'postgresql+psycopg2://'+PG_USER+':'+PG_PASSWD+'@'+PG_HOST+':'+PG_PORT+'/'+PG_DATABASE

Base = declarative_base()

class UserAccountStatus(Base):
    __tablename__ = 'user_account_status'

    id = Column(Integer, primary_key=True)
    code = Column(String(50))
    name = Column(String(100))


class UserProfile(Base):
    __tablename__ = 'user_profile'

    id = Column(Integer, primary_key=True)
    first_name = Column(String(80))
    last_name = Column(String(80))
    user_name = Column(String(50))
    name = Column(String(254))
    oauth_provider = Column(String(20))
    email = Column(String(254))
    picture = Column(String(250))

class UserAccount(Base):
    __tablename__ = 'user_account'

    user_profile_id = Column(Integer, ForeignKey('user_profile.id'),primary_key=True)
    user_name = Column(String(50), nullable=False)
    pw_hash = Column(String(254), nullable=False)
    email = Column(String(254), nullable=False)
    pw_reminder_token = Column(String(254))
    pw_reminder_expire = Column(String(254))
    email_confirmation_token = Column(String(254))    
    user_profile = relationship(UserProfile)    
    user_account_status_id = Column(Integer,ForeignKey('user_account_status.id'))
    user_account_status = relationship(UserAccountStatus)

	# user_account_status_id – the status of the account. The possible statuses 
	# (such as EMAIL_CONFIRMED, or EMAIL_NON_CONFIRMED) are stored in a table user_account_status. 
	# The column is a foreign key referencing the table user_account_status. 
	# Putting possible statuses in a separate table allows to add new statuses if they are needed.

class FacebookAccount(Base):
    __tablename__ = 'facebook_account'

    user_profile_id = Column(Integer,ForeignKey('user_profile.id'), primary_key=True)
    facebook_id = Column(String(50))

class GoogleAccount(Base):
    __tablename__ = 'google_account'

    user_profile_id = Column(Integer,ForeignKey('user_profile.id'), primary_key=True)
    google_id = Column(String(50))



engine = create_engine(PG_CONN)

Base.metadata.create_all(engine)
