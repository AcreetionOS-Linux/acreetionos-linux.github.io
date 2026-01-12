const graphContainer = document.getElementById("graph-container");
const loadingStatus = document.getElementById("loading-status");
const gitgraph = GitgraphJS.createGitgraph(graphContainer);

const repoList = document.getElementById('repo-list');
const repoSearch = document.getElementById('repo-search');

const API_URL = 'https://api.github.com/orgs/AcreetionOS-Linux/repos';

let allRepos = [];

function createRepoCard(repo) {
    return `<div class="repo-card" onclick="window.open('${repo.html_url}', '_blank')">
        <div class="repo-title">${repo.name}</div>
        <div class="repo-desc">${repo.description ? repo.description : 'No description provided.'}</div>
        <div class="repo-meta">
            <span title="Stars">⭐ ${repo.stargazers_count}</span>
            <span title="Forks">🍴 ${repo.forks_count}</span>
            <span title="Open Issues">🐞 ${repo.open_issues_count}</span>
            <span title="Language">💻 ${repo.language ? repo.language : 'N/A'}</span>
        </div>
        <a class="repo-link" href="${repo.html_url}" target="_blank">View on GitHub</a>
    </div>`;
}

function renderRepos(repos) {
    if (repos.length === 0) {
        repoList.innerHTML = '<div class="loading-status">No repositories found.</div>';
        return;
    }
    repoList.innerHTML = repos.map(createRepoCard).join('');
}

function filterRepos() {
    const query = repoSearch.value.toLowerCase();
    const filtered = allRepos.filter(repo =>
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query))
    );
    renderRepos(filtered);
}

async function fetchRepos() {
    loadingStatus.textContent = 'Loading organization repositories...';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allRepos = await response.json();
        renderRepos(allRepos);
        loadingStatus.textContent = `Showing ${allRepos.length} repositories.`;
    } catch (error) {
        loadingStatus.textContent = `Error: ${error.message}`;
    }
}

repoSearch.addEventListener('input', filterRepos);

fetchRepos();
