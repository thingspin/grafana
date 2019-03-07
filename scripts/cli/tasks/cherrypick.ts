import { Task, TaskRunner } from './task';
import axios from 'axios';

interface CherryPickOptions {}

const cherryPickRunner: TaskRunner<CherryPickOptions> = async () => {
  let client = axios.create({
    baseURL: 'https://api.github.com/repos/grafana/grafana',
    timeout: 10000,
  });

  const res = await client.get('/issues', {
    params: {
      state: 'closed',
      labels: 'cherry-pick needed',
    },
  });

  // sort by closed date
  res.data.sort(function(a, b) {
    return new Date(b.closed_at).getTime() - new Date(a.closed_at).getTime();
  });

  for (const item of res.data) {
    if (!item.milestone) {
      console.log(item.number + ' missing milestone!');
      continue;
    }

    console.log(item.number + ' closed_at ' + item.closed_at + ' ' + item.html_url);
    const issueDetails = await client.get(item.pull_request.url);
    const commits = await client.get(issueDetails.data.commits_url);

    for (const commit of commits.data) {
      console.log(commit.commit.message + ' sha: ' + commit.sha);
    }
  }
};

export const cherryPickTask = new Task<CherryPickOptions>();
cherryPickTask.setName('Cherry pick task');
cherryPickTask.setRunner(cherryPickRunner);
