# what will this return??
console.log(2&&30); 
- 30 : bcoz if 1st value is true then return 2nd value

console.log(0&&30);
- 0 : bcoz if 1st value is false then return 1st value itself


## where to handle password confirmation validation??
- best Approach: Add Custom Validation to Zod Schema  by refine
- why this is best :
Keep all validation logic in one place
Show the error message under the confirmPassword field
Prevent form submission if passwords don't match
- other approach: Validate in onSubmit , but this will be worse user experience ,since form submit hone ke baad error aaye ga.
- The .refine() method in Zod allows you to add custom validation logic to your schema. It's useful when you need to validate fields based on relationships between them (like checking if password and confirmPassword match). 
- .refine(validatorFunction, errorConfig)
- validatorFunction → A function that checks if the data is valid (returns true/false or a Promise).
errorConfig → An object that defines:
message: The error message if validation fails.
path: Where the error should be attached (e.g., ["confirmPassword"] means the error will appear under confirmPassword in formState.errors).

## about cookie and token:
- backend will send token when user is logged in, browser automatically sotres token in cookies // we not need to handle this
- but why browser is storing token in cookies?? -> because cookies are more secure ->after storing token in cookies by browser then there is no method through which you can access that token by JS for security reason
- in future request browser will automatically attach token in request header



## when we loggin into application:
- after loggin some basic info like name, email & profile photos are immediately displayed on website
- for that we have to send these basic info to frontend after register successfully
- now these basic info is used by various components, hence store them in Redux store
- now if i close leetcode, data in Redux get removed
- state variable stores data in RAM(inMemory)
- now if you re-enters in website your info will not display
- jwt token tho valid hai isliye login tho ho jaoge, but what about your basic info???
- whenever user re-enters our website, one request(with token by browser(if having)) is automatically sends to backend to check-auth api , if token is valid then user's data will be send else redirect to login/signup page
- for new user, token is not present , therefore we can redirect him/her to login/signup page


- what info is stored in Store??
- user
- loading: when we sent request to backend then loading true, whenever loading is true further any request is not allowed
- isAuthenticated: boolean value - user authenticated hai ya nhi
- error


## fetch data in store or local component ??
- since, basic info is used in used in multiple components, therefore fetch this data in Global Store by createAsyncThunk
- allProblem are to be displayed in one component then fetch them in local component


## cors issue:
- frontend: localhost:5173
- backend: localhost:3000
- since, domainName is same, but port no. are different. therefore, browser is making ristriction(postman mei error nhi aati thi, since no browser) bcoz of different origin
- but why browser is making such complications??
- ex: for one user's browser 2 websites are open, 1st is Banking website(sbi.com), 2nd is evil website, if evil website makes request to Banking Backend then browser automatically adds token to request, and then evil website also gain access to your banking account(browser ka simple kaam hai given request jis API hi hai uske related token attach kr dega) -> to prevent this browser checks if origin are same or not.
- solution: whenever backend replies then it will mention that only Banking request will be able to use that Token, ki iss token ko sirf sbi.com hi use krr skti hai



## Error of duplicate key error collection: LeetCode.users index: problemSolved_1 dup key: { problemSolved: undefined }
In mongo shell / mongosh:
use LeetCode      // your DB name
db.users.getIndexes();                    // list indexes
db.users.dropIndex({ problemSolved: 1 }); // drop by key
// or drop by name if you saw "problemSolved_1" name:
db.users.dropIndex("problemSolved_1");



## properties applied on array:
.filter
.map
.every
.some
.find



## monaco-editor
- does not operates on react // like when we enter anything in input box then our component is re-rendered
- it directly manupulates the DOM // therefore, no re-render
- editorRef = useRef(null) // this will store the refference
- editorRef.current = editor;  // storing refference of the editor component where it is stored in the memory
- onMount: The onMount prop is a callback function that gets called when the Monaco Editor instance is fully loaded and mounted. It gives you access to the editor instance and the Monaco API.



## What is MicroServices??
- for user, problem and submission we have different databases for these
- hrr koi independently kaam kre




## Navigate on Route
- Navigate('/')
- <Navigate to="/"></Navigate>
- <NavLink to="/"></NavLink>





## Task
- make responsive
- change your icon everywhere
- List Your application in market place
