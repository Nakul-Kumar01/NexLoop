
npm i:
express
dotenv
mongoose
cookie-parser
validator
bcrypt
jsonwebtoken
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
redis
axios
cors


### how to make any functionality??
1) models
2) routes
3) controler
4) middleware


- in .env you can use "" or not , as your wish

-     const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k)); 
here, Object.keys(data) will form array of keys of data


- project -> can hv many cluster -> can hv mny database -> can hv mny collection -> can hv mny document -> can hv many fields

### HTTP Status Code
- 200 ok: request succeeded (i.e. GET or POST completed)
- 201 created: successful post request
- 400 bad request
- 401 unauthrized access
- 500 "Internal Server Error", indicates that the server encountered an unexpected condition that prevented it from fulfilling the client's request.
- 404 Not Found

### Frontend:
- dazyui , sersian for ui, Tailwind, Redux, zod , react-form


### Mongoose Commands
- create
- exist
- find // return array
- findOne
- findOneAndDelete -> we pass value in it by {}
- findById
- findByIdAndUpdate
- findByIdAndDelete -> we pass value in it without {}
- Problem.find({
    votes: {$gte : 100},  // greater than equal to
    tags: {$in: ["array","hashmap"]}  // innme se koi bhi match ho
    difficulty: {$ne : 'easy'}  //not equal
})



- findById().select('_id title description -hiddentTestCase tags')  // by select, we can pick particular fields only
- save
- .populate()
- deleteMany

# save vs findByIdAndUpdate
- Works on an existing document instance(retrieved via findOne, findById, etc.).   - Directly updates the document in the database without loading it into memory first.
- Returns the modified document after saving.  - Can return either the old or updated document based on the new option.
- findByIdAndUpdate: 2 step process : 1) fetch user detail and update it(but abhi ye changes local mei hai) 2) save() the changes in DB
- save() : 1 step process
 

### JS Command:
- array.join(','); // return a string with comma seperated elements


### why we use Axios if we have Fetch ??
- it automatically transforms JSON data, so you don't hv to do response.json() like with Fetch
- error handling: with Fetch you hv to check if the response is ok and throw an error yourself. Axios does this automatically


### why we marked base64_encoded: 'false' instead of 'true'???
- since our submission array is not encoded in base64, simply json format is traveling
-If submission’s source_code, stdin or expected_output contains non printable characters, or characters which cannot be sent with JSON, then set base64_encoded parameter to true and send these attributes Base64 encoded. Your responsibility is to encode each of mentioned attributes (source_code, stdin and expected_output) even if just one of them contains non printable characters. By default, this parameter is set to false and Judge0 assumes you are sending plain text data.


### how to Implement pagination???
- initially give me 10 problem, now when i click next then give me another 10 problem :: By the method of Pagination
- api: /problem/getAllProblem?page=2&limit=10
- skip = (page-1)*limit = 10  ,   limit = 10
- await Problem.find().skip(10).limit(10)
- await Problem.find({difficulty:'easy', tag:'array'}).skip(10).limit(10) // appling Filters
- Appling Filters : 
Problem.find({
    votes: {$gte : 100},  // greater than equal to
    tags: {$in: ["array","hashmap"]}  // innme se koi bhi match ho
    difficulty: {$ne : 'easy'}  //not equal
})

| Operator | Meaning                | Example URL Query          | MongoDB Equivalent              |
|----------|-------------------------|----------------------------|---------------------------------|
| $eq      | Equal                   | ?difficulty=easy           | { difficulty: "easy" }          |
| $ne      | Not equal               | ?difficulty!=hard          | { difficulty: { $ne: "hard" } } |
| $gt      | Greater than            | ?votes[gt]=100             | { votes: { $gt: 100 } }         |
| $gte     | Greater than or equal   | ?votes[gte]=100            | { votes: { $gte: 100 } }        |
| $lt      | Less than               | ?votes[lt]=50              | { votes: { $lt: 50 } }          |
| $lte     | Less than or equal      | ?votes[lte]=50             | { votes: { $lte: 50 } }         |
| $in      | Match any value in array| ?tags[in]=array,hashmap    | { tags: { $in: ["array", "hashmap"] } } |
| $nin     | Exclude values in an array | ?tags[nin]=dp          | { tags: { $nin: ["dp"] } }      |



### const allProblem = await Problem.find({}); and const allProblem = await Problem.find(); -> Both are same thing -> return all documents from the Problem collection


### why JWT Token is base64 encoded??
- Base64 converts binary data into ASCII text (A-Z, a-z, 0-9, -, _, =).
- Each part (header, payload, signature) of the JWT is base64 encoded. But note: it's actually base64url encoded (a URL-safe version of base64 encoding). 
- Base64url encoding avoids characters like `+`, `/`, and `=` that have special meanings in URLs, replacing them with `-`, `_`, and omitting padding when possible (or using `=` only for padding when necessary).
-  Base64 is NOT encryption! It’s just encoding. Anyone can decode it to see the original data. Never put sensitive info (passwords, SSN) in a JWT!
- we encode jwt token just bcoz, it can transmite easily in URLs or HTTP headers without special character issues.


### When we run our code: 
- only visible testcase runs and history is not maintained


## when we Submit our code:
- visible + hidden testcase runs and history is maintained

### Automatic _id Field in MongoDB
- Even if you don't define an _id field in your schema, MongoDB automatically adds it to every document. Purpose: Serves as the primary key to uniquely identify documents. Type: ObjectId (a special 12-byte BSON type)
- userId: {      // This defines a relationship between collections (similar to foreign keys in SQL)
        type: Schema.Types.ObjectId,   // Specifies this field stores MongoDB ObjectIds (like those in _id fields)
        ref: 'user',    // Tells Mongoose this refers to documents in the 'user' collection (your User model)
        required: true
    },
-  .populate("field") // jisko ye field reffer kr rahi hai uski info ko fetch krke leke aao



### to Fetch submission of any particular problem of any user:
- we hv to give both userID and ProblemID
- But in Leetcode platform there are much much submissions
- fast fetching is possible due to Indexing(mentioned in _id) also same with if field hving 'unique: true', then indexing is automatically created
- in submission schema we have only indexing for '_id', not for userID and ProblemID , therefore searching will be time consuming
- M-1 : in required field mention 'index:true' // now index will be created in that field.  if we made index for each field, this will be not good ,bcoz index also require memory.
- therefore, apply indexing to those field only which are fetched by user multiple times 
- M-2 : so for that we use Compound Index(we can make our own index also) : we can form index from combination of userID and ProblemID


CONCLUSION:
- fast searching is possible by: indexing
- by default indexing is applied on '_id' or on field hving 'index:true'
- you can also apply indexing on combination of two or more field by compound indexing


## Compound Indexing:       ** IMPORTANT **
- submissionSchema.index({userId:1,problemId:1});
- here, 1 means, arrange userId in Acsending Order
- How indexing is working?? (Implemedted over B++ tree)
Step-1: Initial state
Uid  Pid      
4    10
6    8
4    9
4    10
5    7
   
Step-2: arrange userId in ascending order(since, ye phale likha hai)
Uid  Pid      
4    10
4    9
4    10
5    7
6    8

Step-3:  now arrange problemId in asc order if same userId
Uid  Pid      
4    9
4    10
4    10
5    7
6    8

- now searching mei log(n) time lage ga, by using Binary Search.
- B++ tree, range query ko bhi solve krke dedeta hai
- now, since userId is in sorted order therefore you can also apply query on userId and they are also Optimised.
- Can we apply Optimised query on ProblemId : No, since not in sorted order.
- if you hv made compound indexing of abc, then you can also use a, ab for optimised query.

- for single Schema their will be Multiple Index
- _id have its own indexing or any field hving 'index:true' also hv their indexing
- Example: 688f711978f40c4f5b6f0da1  this is _id of any user and we want to fetch data of this user by its _id:
  1) since, _id hv its indexing theirfore query will be optimised
  2) _id me se index check kra, then find data according to that indexing of _id




### React Revision ##
- useState(): return array [state,setState], where setstate(state=> state+1) will update value of state by re-render
- useEffect() : used for fetching etc. , executes at last
funtion Moon(){
    let count = 12;
    let mount = 10000000;
    let total = 0;

    console.log(count);
    console.log("Hello Bhai");

    for(let i=0;i<mount;i++)    //this expensive calculation will delay our UI // therefore, we need to execute it in last of code by useEffect()
    total+=1;

    console.log(total);
}



- to deal with props Drilling: 1) useContext or 2) redux 
- difference b/w React.memo()  vs   useCallback()
What it memoizes	Whole component	                Single function
Purpose	            Prevent component re-renders	Prevent function recreation
Trigger for update	When props change	            When dependencies change
- if you want to memorize entire component : React.memo() // function dobara render hi nhi hoga , until props has been changed
- if you want to prevent recreation of any function(by using the prev refference of function) : useCallback() // jo function phale use kiya tha usika refference use krlo
- useRef() 
      - Unlike regular variables that reset on every render, useRef keeps its value
      - Changing a ref's value doesn't make your component re-render (unlike useState)
      - Use useState when the value changes and you need the component to re-render
      - Use useRef when the value changes but you don't want a re-render


## What is an "Origin"?
An origin is defined by the combination of:
Protocol → e.g., http, https
Domain / Hostname → e.g., example.com, localhost
Port → e.g., 80, 443, 5173
- Now, Two URLs are considered the same origin if all three match.
- Browsers enforce the Same-Origin Policy (SOP) for security.
- If your frontend tries to fetch data from a different origin, the request is blocked unless the server explicitly allows it with CORS (Cross-Origin Resource Sharing).


### What happens with your relative API call?
axiosClient.get("/problem/getAllProblem?page=1")
This is a relative URL.

So the browser converts it into:
Request URL = window.location.origin + "/problem/getAllProblem"

If your site is loaded from: https://nexloops.xyz

Then the final request becomes: https://nexloops.xyz/problem/getAllProblem


Browser sees this 👇
Origin header: https://nexloops.xyz
Request URL:  https://nexloops.xyz/problem/getAllProblem


✅ Same protocol
✅ Same domain
✅ Same port

➡️ SAME ORIGIN

Hence:
- Browser does NOT perform any CORS validation
- Backend CORS config is completely ignored
- Request always goes through
- tbhi sirf origin: 'http://localhost:5173' pe bhi work krega


### why CORS is skipped ??
- since, VITE_API_URL=/api is present in .env.production
- So axios builds the URL like this: /api/problem/getAllProblem
- now, When a URL does not contain a scheme (http/https), the browser automatically resolves it as:
     - https://FRONTEND_URL/api/problem/getAllProblem
     - hence, request made is -> https://nexloops.xyz/api/problem/getAllProblem
- Why CORS is completely bypassed here??
     - Because from the browser’s POV:
     - Origin header: https://nexloops.xyz
     - Request URL:  https://nexloops.xyz/api/problem/getAllProblem
     - There is no cross-origin request
- Where Nginx comes in (very important) :
    - Your Nginx probably has something like:

       location /api/ {
          proxy_pass http://localhost:3000/;
       }

So the flow is:
Browser → https://nexloops.xyz/api/problem
Nginx   → http://localhost:3000/problem
Backend → response

- since nginx converts request into http://localhost:3000/problem  //Cors ka chakkr backend pe nahi hota, therefore backend will directly reply to the request(no need of app.use(cors) in backend)
- what does this mean?? origin: 'http://localhost:5173'  // when backend will recieve request from this origin then backend will add something in header of localhost:5173 this request so that browser will remove cors issue

     

## how client(frontend) making request to server??
Frontend (React/Vite): runs on http://localhost:5173
Backend (Node.js/Express + mongobd): runs on http://localhost:3000
- Since 5173 ≠ 3000, this is cross-origin.
- You must enable CORS on the backend (e.g., app.use(cors()) in Express).


## for Error: getaddrinfo ENOTFOUND judge0-ce.p.rapidapi.com
nslookup judge0-ce.p.rapidapi.com
curl -v https://judge0-ce.p.rapidapi.com/
ipconfig /flushdns   # try flush if DNS seems stale



## Video integration in Cloudinary
- public_id : it is the id after the url
- https://cloudinary/upload/public_id
- if you hv publicID, then you don't need video URL, Thumbnail URL to store, since ye sabke liye same format rakhta hai, therefore we can generate it on the go
- publicID and public_key both are different
- we ourself generate a meaningfull publicID, otherwise cloudinary will generate some random publicID
- we will upload video by formdata(normal form nhi hai), when we need to handle multiple form of data(vdo, images, etc)
- jbb vdo vgra bhajne ki baari hogi tbb formdata use hoga, baaki UI mei tho react-hook-form se hi display hoga
- normal form only handle json data of text



## To add some functionalities i.e. play, pause etc ??
- React does not hv those methods, so we use js to access the dom element and directy do dom manupulation
- we will use 'useRef()' hook to access video element
- in userProblem, when data is fetched into getProblem ,and we were inserting our own safeUrl, thumbnailUrl as key in getProblem which is not present in our schema of problem, so these key were not inserted in getProblem: to resolve this we will create our own object and by converting getProblem into js Object(.toObject()), -> converting mongoose document into js object



## How i calculate the Rank of user??
- since their are many users so i simple Nodejs loop will be less efficient
- therefore, we use MondoDB Aggregation for Performance optimization for large data (MongoDB computes faster internally than Node loops)




### contest model schema:
"_id": "ObjectId",
"name": "Weekly Challenge",
"description": "This week’s coding contest",
"startTime": "2025-11-10T15:00:00Z",
"endTime": "2025-11-10T18:00:00Z",
"problems": ["problemId1", "problemId2"],
"participants": ["userId1", "userId2"],
"status": "upcoming/running/completed"


### contest user
- created when user register for contest
- contestId and userId
- given or not
- points
- rank
- solvedProblem



### Login with google ###
- npm i passport
- npm install passport-google-oauth20

1) Google Login Button (Frontend)
window.open('http://localhost:3000/user/google', '_self');

- Browser goes to backend
- Frontend is now OUT of the picture

2) /user/google Route (Backend)

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);
* redirect to google for authentication: choose your google account and give permission to our app and then redirect to callback URL (that we hv taken from googleStrategy and matches with redirect URI in google cloud console)
* Builds Google OAuth URL
* Includes:
  * client_id
  * scope
  * **redirect_uri**  // already stored when server starts // vo 3 credentials(in passport.js) store krva liye the 

Example redirect:
https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:3000/user/google/callback


- Redirect_uri Matching Rule
The redirect_uri MUST MATCH EXACTLY in 3 places:
1. `config/passport.js`
2. Google Cloud Console → Authorized redirect URIs
3. Backend route URL

-  User Logs In on Google Screen
* Google shows account chooser
* User selects Gmail
* User clicks **Allow**

If redirect URI is matches with redirect URI in google cloud console → then only Google continues



3)  Google Redirects BACK to Backend

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  googleLogin
);

- Why passport.authenticate is REQUIRED here??
* this code Executes GoogleStrategy callback(passport.js ka callback) and Sets `req.user`, otherwise req.user will be undefined
* after getting permission from user, google will redirect to this callback URL with accessToken, refreshToken and profile info


4) then execute googleLogin controller
* JWT created
* Token stored in cookie
* User redirected to frontend