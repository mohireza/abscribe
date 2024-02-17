from flask import Flask, redirect, url_for, request, jsonify
import pymongo

import os
from dotenv import load_dotenv
import pandas as pd
import json

load_dotenv()


# Load Database
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
db_client = pymongo.MongoClient(MONGODB_CONNECTION_STRING)
db = db_client["abtestingtool"]
Campaigns = db["campaigns"]


app = Flask(__name__)


# Run flask run to start the server.
# Ask Pan for the mongodb credentials, or create your own.
def check_logged_in():
    # TODO: check if the user is logged in, are we using Firebase?
    return True


@app.route("/participant_list", methods=["POST", "GET"])
def participantList():
    if not check_logged_in():
        return jsonify(status=403, message="You are not logged in.")
    if request.method == "POST":
        # The frontend needs to send a post request with a CSV file. The email column is must-to-have. No personal content for now.
        file = request.files.get("participantList")
        campaignName = request.form.get("campaignName")
        df = pd.read_csv(file)

        new_campaign = {
            "campaignName": campaignName,
            "participantList": list(df["email"]),
        }
        Campaigns.insert_one(new_campaign)
        return jsonify(status=200, message="Uploaded")
    else:
        campaignName = request.form.get("campaignName")
        the_campaign = Campaigns.find_one({"campaignName": campaignName})
        return jsonify(
            status=200,
            message="Returned participant list",
            data=the_campaign["participantList"],
        )
