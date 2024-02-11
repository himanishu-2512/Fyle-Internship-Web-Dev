const currPage = document.querySelector("#curr-page");
const totalPage = document.querySelector("#total-page");
const prev = document.querySelector("#prev");
const next = document.querySelector("#next");
const selected = document.getElementById("selectedId");
const repoContainer = document.querySelector(".repo-grid");
const loader = document.getElementById("loader");
const mainLoader=document.querySelector(".loader");
const repoSearch = document.getElementById("repo-search");
let totalPageNo;
let totalRepo;
let userName;

//For adding the params to the url
function addUrlParameter(name, value) {
  var searchParams = new URLSearchParams(window.location.search);
  searchParams.set(name, value);
  window.location.search = searchParams.toString();
}

//Dynamically inseting the repositories in the html DOM
function repoDisplay(repositories) {
  const repoList = repositories
    .map((repo) => {
      return `<div class="repo-card">
              <a href=${repo?.svn_url}>
                <h3>${repo?.name}</h3>
              </a>
              <div class="repo-description">${repo.description || ""}</div>
              <div class="repo-info">
            
                ${
                  repo?.language
                    ? `
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="language-icon">
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="1"></circle>
                      </svg>
                      <div>${repo.language}</div>
                    </div>`
                    : ""
                }
              <div>
              <div class="material-symbols-outlined">
              star
              </div>
             ${repo.stargazers_count}
            </div>
          </div>
       </div>`;
    })
    .join("");
  repoContainer.innerHTML = repoList;
  loader.style.display = "none";
}

//getRepositories sending requesting to the server
async function getRepositories(pageNo, perPageRepo) {

  loader.style.display = "block";
  if (repoSearch.value != "") {
    const repositories = await fetch(
      `https://fyle-internship-web-dev-backend.vercel.app/repos/${userName}/${currPage.innerHTML}/${selected.value}?reponame=${repoSearch.value}`
    ).then((res) => res.json());
    totalRepo = repositories.totalRepo;
    totalPage.innerHTML =
      totalRepo % selected.value == 0
        ? Math.floor(totalRepo / selected.value)
        : Math.floor(totalRepo / selected.value) + 1;
    return repositories.slicedRepoList;
  } else {
    const repositories = await fetch(
      `https://fyle-internship-web-dev-backend.vercel.app/users/${userName}/repos/${pageNo}/${perPageRepo}`
    ).then((res) => res.json());
    totalPage.innerHTML =
      totalPageNo % selected.value == 0
        ? Math.floor(totalPageNo / selected.value)
        : Math.floor(totalPageNo / selected.value) + 1;
    return repositories.data;
  }
}

//DOM Content
document.addEventListener("DOMContentLoaded", async () => {
  //accessing the username from the url
  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get("user");

  // Fetch user data from GitHub API
  const userData = await fetch(
    `https://api.github.com/users/${username ? username : "himanishu-2512"}`
  ).then((response) => response.json());

  // Update profile information
  totalPageNo = userData.public_repos;
  userName = userData.login;
  mainLoader.style.display="none"

  if (!userName) {
    document.querySelector(".main").innerHTML = `<div class="error"><h1>404 - User Not Found</h1>
    <svg id="error-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm.414-13.414a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5a1.5 1.5 0 0 0-1.5-1.5zm-.5-6.5a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-4a1 1 0 0 0-1-1z"/>
    </svg>
    </div>`;
  }
  else{
  //set the basic info of page like total repo pages a/c to maximum display count per page
  totalPage.innerHTML =
    totalPageNo % selected.value == 0
      ? Math.floor(totalPageNo / selected.value)
      : Math.floor(totalPageNo / selected.value) + 1;

  document.querySelector(".card-right h3").innerHTML = `<a href=${userData.html_url}>${userData.login}</a>`; //sets username
  document.querySelector(".card-right h2").innerHTML = `<a href=${userData.html_url}>${userData.name}</a>`; //sets name
  document.querySelector(".bio").textContent = userData.bio || ""; //sets bio
  document.querySelector(".avatar").src = userData.avatar_url; //sets image of the user
  document.querySelector(".card-right .email").textContent = userData.email
    ? `Email: ${userData.email || ""}`
    : ""; //sets the email
  document.querySelector(".card-right .location").textContent =
    userData.location ? `Location: ${userData.location}` : ""; //sets the location

  // Fetch user repositories from GitHub API
  const repositories = await getRepositories(
    currPage.innerHTML,
    selected.value
  );
  repoDisplay(repositories);}
});

//search github profile by username
document.getElementById("user-search").addEventListener("change", (e) => {
  addUrlParameter("user", e.target.value);
});

//Filter Repos by their name
repoSearch.addEventListener("change", async () => {
  loader.style.display = "block";
  const repositories = await getRepositories(
    currPage.innerHTML,
    selected.value
  );
  repoDisplay(repositories);
});

//Event triggers when the select input value is changes
selected.addEventListener("change", async () => {
  if (repoSearch.value == "") {
    totalPage.innerHTML =
      totalPageNo % selected.value == 0
        ? Math.floor(totalPageNo / selected.value)
        : Math.floor(totalPageNo / selected.value) + 1;
    currPage.innerHTML = 1;
  } else {
    totalPage.innerHTML =
      totalRepo % selected.value == 0
        ? Math.floor(totalRepo / selected.value)
        : Math.floor(totalRepo / selected.value) + 1;
  }
  const repositories = await getRepositories(
    currPage.innerHTML,
    selected.value
  );
  repoDisplay(repositories);
});

/**Event triggers when prev button is clicked**/
prev.addEventListener("click", async () => {
  if (currPage.innerHTML > 1) {
    currPage.innerHTML = currPage.innerHTML - 1;
    const repositories = await getRepositories(
      currPage.innerHTML,
      selected.value
    );
    repoDisplay(repositories);
  }
});

/**Event triggers when next button is clicked**/
next.addEventListener("click", async () => {
  if (Number(currPage.innerHTML) < Number(totalPage.innerHTML)) {
    currPage.innerHTML = Number(currPage.innerHTML) + 1;
    const repositories = await getRepositories(
      currPage.innerHTML,
      selected.value
    );
    repoDisplay(repositories);
  }
});
