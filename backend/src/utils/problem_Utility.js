const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const axios = require('axios');


const getIdByLanguage = (language) => {

  const languageId = {
    "c++": 54,
    "java": 62,
    "javascript": 63,
    "python": 71
  }

  return languageId[language.toLowerCase()];
}

const submitBatch = async (submissions) => {
  //  console.log("hello");
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'false' // if true, then we have to send base64 encoded code // when false, then we have to send plain code
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_RAPIDAPIKEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      // console.log("done1");
      const response = await axios.request(options);
      // console.log("done2");
      return response.data;   // what will this return?? // it will return array of tokens // now, we will make GET request with each token and fetch actual result
    } catch (error) {
      if (error.response) {
        // console.log("done3");
    console.error('Judge0 error status:', error.response.status);
    console.error('Judge0 error body:', error.response.data);
  } else {
    // console.log("done4");
    console.error("its error: " +error);
  }
  // console.log("done5");
  // throw new Error(`Failed to submit batch: ${error.message}`);
    }
  }

  return await fetchData();

}


function waiting(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}



/**
 * decode base64 to utf-8 safely (returns null if the field is null/undefined)
 */
function decodeBase64Field(field) {
  if (field === null || field === undefined) return null;
  try {
    return Buffer.from(field, 'base64').toString('utf-8');
  } catch (e) {
    // fallback: return original field if something weird happens
    return field;
  }
}

const submitToken = async (resultToken) => {
  // guard: ensure resultToken is an array
  if (!Array.isArray(resultToken) || resultToken.length === 0) return [];

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(','),           // comma separated tokens
      base64_encoded: 'true',                  // <--- important: ask for base64
      fields: '*'                              // or limit to: 'stdout,stderr,compile_output,status_id,token'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_RAPIDAPIKEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    },
    timeout: 60_000
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      // bubble up enough info so calling code can handle it
      console.error('Judge0 fetch error:', error?.response?.data ?? error.message);
      // rethrow so outer code can decide (or you can return null)
      throw error;
    }
  }

  while (true) {
    let result;
    try {
      result = await fetchData();
    } catch (err) {
      // if we get a 400 again, log it and throw (or you can retry few times)
      throw err;
    }

    // defensive: if result or result.submissions missing, wait and retry
    if (!result || !Array.isArray(result.submissions)) {
      await waiting(1000);
      continue;
    }

    // decode fields for each submission
    const decodedSubmissions = result.submissions.map(sub => {
      const decoded = {
        ...sub,
        stdout: decodeBase64Field(sub.stdout),
        stderr: decodeBase64Field(sub.stderr),
        compile_output: decodeBase64Field(sub.compile_output),
        message: decodeBase64Field(sub.message) // sometimes used for compilation messages
      };
      return decoded;
    });

    // check statuses: status_id > 2 means finished (Judge0 convention)
    const allDone = decodedSubmissions.every(r => typeof r.status_id === 'number' && r.status_id > 2);

    if (allDone) {
      // return decoded submissions so caller can display compile_output etc
      return decodedSubmissions;
    }

    // not done yet - wait and loop
    await waiting(1000);
  }
};


module.exports = { getIdByLanguage, submitBatch, submitToken };