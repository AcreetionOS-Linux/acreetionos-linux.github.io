const graphContainer = document.getElementById("graph-container");
const loadingStatus = document.getElementById("loading-status");
const gitgraph = GitgraphJS.createGitgraph(graphContainer);

const repoList = document.getElementById('repo-list');
const repoSearch = document.getElementById('repo-search');
const modal = document.getElementById('modal');

const ORG = 'AcreetionOS-Linux';
const API_URL = `https://api.github.com/orgs/${ORG}/repos`;

let allRepos = [];

function createRepoCard(repo) {
    return `<div class="repo-card" data-repo="${repo.name}">
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
    document.querySelectorAll('.repo-card').forEach(card => {
        card.addEventListener('click', () => showRepoDetails(card.getAttribute('data-repo')));
    });
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

// Modal logic for repo details
async function showRepoDetails(repoName) {
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-content"><button class="modal-close" title="Close">×</button><div class="loading-status">Loading details...</div></div>`;
    modal.querySelector('.modal-close').onclick = () => { modal.style.display = 'none'; };
    try {
        // Fetch contributors, commits, issues, PRs in parallel
        const [contributors, commits, issues, prs] = await Promise.all([
            fetch(`https://api.github.com/repos/${ORG}/${repoName}/contributors`).then(r => r.json()),
            fetch(`https://api.github.com/repos/${ORG}/${repoName}/commits?per_page=5`).then(r => r.json()),
            fetch(`https://api.github.com/repos/${ORG}/${repoName}/issues?state=open&per_page=5`).then(r => r.json()),
            fetch(`https://api.github.com/repos/${ORG}/${repoName}/pulls?state=open&per_page=5`).then(r => r.json()),
        ]);
        modal.querySelector('.loading-status').remove();
        modal.querySelector('.modal-content').innerHTML += `
            <div class="modal-section">
                <h3>Top Contributors</h3>
                <ul>${contributors.map(c => `<li><a href="${c.html_url}" target="_blank">${c.login}</a> (${c.contributions} commits)</li>`).join('') || '<li>No contributors found.</li>'}</ul>
            </div>
            <div class="modal-section">
                <h3>Latest Commits</h3>
                <ul>${commits.map(cm => `<li><a href="${cm.html_url}" target="_blank">${cm.commit.message.split('\n')[0]}</a> by ${cm.commit.author.name}</li>`).join('') || '<li>No commits found.</li>'}</ul>
            </div>
            <div class="modal-section">
                <h3>Open Issues</h3>
                <ul>${issues.filter(i => !i.pull_request).map(i => `<li><a href="${i.html_url}" target="_blank">${i.title}</a></li>`).join('') || '<li>No open issues.</li>'}</ul>
            </div>
            <div class="modal-section">
                <h3>Open Pull Requests</h3>
                <ul>${prs.map(pr => `<li><a href="${pr.html_url}" target="_blank">${pr.title}</a></li>`).join('') || '<li>No open PRs.</li>'}</ul>
            </div>
        `;
    } catch (error) {
        modal.querySelector('.modal-content').innerHTML += `<div class="loading-status">Error loading details: ${error.message}</div>`;
    }
}
