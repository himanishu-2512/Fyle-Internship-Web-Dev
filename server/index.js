const express = require("express");
const fetch = require("node-fetch");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { Octokit } = require("octokit");

//cors-cross origin resource sharing
app.use(cors({ origin: "*" }));
const octokit = new Octokit({
  auth: process.env.API_KEY,
  request: {
    fetch: fetch,
  },
});


async function fetchRepositoryDetails(username, content, pageno) {
  try {
    const repoResponse = await octokit.request("GET /users/{username}/repos", {
      username,
      per_page: content,
      page: pageno,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return repoResponse;
  } catch (error) {
    throw new Error(`Error fetching repository details: ${error.message}`);
  }
}


// get repositories when the search query is empty
app.get("/users/:username/repos/:pageno/:content", async (req, res) => {
  const { username, pageno, content } = req.params;
  try {
    const repoList = await fetchRepositoryDetails(username, content, pageno);
    res.send(repoList);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// get repositories on the basis of search/keyword
app.get("/repos/:username/:pageno/:content", async (req, res) => {
  const { username, pageno, content } = req.params;
  const { reponame } = req.query;

  try {
    const repoResponse = await octokit.request("GET /users/{username}/repos", {
      username,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
     // Filter repositories based on the provided reponame
    const filteredRepoList = repoResponse.data.filter((item) =>
      item.name.toLowerCase().includes(reponame.toLowerCase())
    );

    // Calculate pagination offsets
    const startIndex = (pageno - 1) * content;
    const endIndex = pageno * content;
    let slicedRepoList;
    if (filteredRepoList.length > endIndex) {
      // Slice the filteredRepoList based on pagination parameters
      slicedRepoList = filteredRepoList.slice(startIndex, endIndex);
    } else {
      slicedRepoList = filteredRepoList.slice(startIndex);
    }

    // Return slicedRepoList as response
    return res.json({ slicedRepoList, totalRepo: filteredRepoList.length });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(8000, (req, res) => {
  console.log("Server is running on port 8000");
});
