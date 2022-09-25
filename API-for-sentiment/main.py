from flask import Flask,request
import random
import joblib
import pickle
import gspread
from oauth2client.service_account import ServiceAccountCredentials


class Sentiment:
    negative="NEGATIVE"
    positive="POSITIVE"

class Review:
    def __init__(self,text,score):
        self.text=text
        self.score=score
        self.sentiment=self.get_sentiment()
    def get_sentiment(self):
        if self.score<3:
            return Sentiment.negative
        else:#when score is 3 or 4 or 5
            return Sentiment.positive

class ReviewContainer:
    def __init__(self,reviews):
        self.reviews=reviews
    def evenly_distibute(self):
        negative=list(filter(lambda x:x.sentiment==Sentiment.negative,self.reviews))
        positive=list(filter(lambda x:x.sentiment==Sentiment.positive,self.reviews))
        #as data contains more positive data sets,we will reduce them into number of negative one's for better accuracy
        positive_shrunk=positive[:len(negative)]
        self.reviews=negative+positive_shrunk
        random.shuffle(self.reviews)


app = Flask(__name__)

@app.route("/",methods=['POST','GET'])
def hello():
    if request.method=='POST':
        rev = request.form.get('txt_message')
        name = request.form.get('txt_name')
        email = request.form.get('txt_email')
        subject = request.form.get('txt_subject')
        cls = joblib.load("final_review_model.sav")
        lis = [rev]
        vectorizer = pickle.load(open("vectorizer.pickle", 'rb'))
        ans = cls.predict(vectorizer.transform(lis))
        ans = str(ans[0])
        print(ans)
        scope = ["https://spreadsheets.google.com/feeds", 'https://www.googleapis.com/auth/spreadsheets',
                 "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_name('./creds.json', scope)
        client = gspread.authorize(creds)
        sheet = client.open('Socket.chats_Reviews').sheet1
        rowdata = [name,email,subject,rev,ans]
        sheet.insert_row(rowdata, 2)
        return ans
    return "None"

app.run(debug=True)