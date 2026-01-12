const graphContainer = document.getElementById("graph-container");
const loadingStatus = document.getElementById("loading-status");
const gitgraph = GitgraphJS.createGitgraph(graphContainer);

const API_URL = "https://api.github.com/orgs/AcreetionOS-Linux/repos";

async function fetchReposAndRender() {
    loadingStatus.textContent = "Fetching organization repositories...";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const repos = await response.json();
        loadingStatus.textContent = `Found ${repos.length} repositories. Fetching commit data...`;
        // For demo: just show repo names in graph
        renderGraph(repos);
        loadingStatus.textContent = "AcreetionOS-Linux organization repositories loaded.";
    } catch (error) {
        console.error("Error fetching organization data:", error);
        loadingStatus.textContent = `Error: ${error.message}.`;
    }
}

function renderGraph(repos) {
    gitgraph.clear();
    repos.forEach((repo, idx) => {
        const branch = gitgraph.branch({ name: repo.name });
        branch.commit({
            subject: repo.description || "No description",
            author: repo.owner.login,
            style: idx % 2 === 0 ? "normal" : "highlight"
        });
    });
}

fetchReposAndRender();
