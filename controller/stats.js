const { usermodel } = require('../model/usermodel');
const fetch = require('node-fetch');

async function getLeetcodeStats(req, res, next) {
    try {
        const userData = req.userData;
        const leetcodeUsername = userData.leetcode_id;

        const [contestRatings, difficultyStats, topicStats] = await Promise.all([ 
            fetchContestRatingslc(leetcodeUsername),
            fetchDifficultyStatslc(leetcodeUsername),
            fetchTopicStatslc(leetcodeUsername)
        ]);

        res.status(200).json({
            contestRatings,
            difficultyStats,
            topicStats
        });
    } catch (err) {
        next(err);
    }
}

async function getGFGStats(req, res, next) {
  const username = req.userData?.gfg_id;
  if (!username) return res.status(400).json({ error: 'GFG username not found' });

  try {
    const [ratingHistory, solvedByDifficulty, solvedByTopic] = await Promise.all([
      getContestHistory(username),
      getSolvedByDifficulty(username),
      getSolvedByTopic(username)
    ]);

    return res.status(200).json({
      username,
      ratingHistory,
      solvedByDifficulty,
      solvedByTopic
    });
  } catch (error) {
    console.error('GFG Stats Fetch Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch GFG stats' });
  }
}


// Only if needed:
// const fetch = require("node-fetch");

async function getCodeforcesStats(req, res, next) {
  try {
    const { codeforces_id } = req.userData;

    // Fetch Contest History
    const contestRes = await fetch(`https://codeforces.com/api/user.rating?handle=${codeforces_id}`);
    const contestData = await contestRes.json();

    const contestHistory = contestData.result.map(contest => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      ratingUpdateTime: contest.ratingUpdateTimeSeconds,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
    }));

    // Fetch Submissions
    const submissionRes = await fetch(`https://codeforces.com/api/user.status?handle=${codeforces_id}&from=1&count=100000`);
    const submissionData = await submissionRes.json();
    const submissions = submissionData.result;

    const topicWiseCount = {};
    const ratingWiseCount = {};
    const solvedProblemsSet = new Set();

    for (const submission of submissions) {
      if (submission.verdict === "OK") {
        const { problem } = submission;
        const key = `${problem.contestId}-${problem.index}`;
        if (solvedProblemsSet.has(key)) continue;
        solvedProblemsSet.add(key);

        // Tags
        if (problem.tags) {
          for (const tag of problem.tags) {
            topicWiseCount[tag] = (topicWiseCount[tag] || 0) + 1;
          }
        }

        // Rating
        if (problem.rating) {
          ratingWiseCount[problem.rating] = (ratingWiseCount[problem.rating] || 0) + 1;
        }
      }
    }

    res.json({
      contestHistory,
      topicWiseCount,
      ratingWiseCount,
      totalSolved: solvedProblemsSet.size,
    });

  } catch (err) {
    console.error("Error fetching Codeforces stats:", err);
    res.status(500).json({ error: "Failed to fetch Codeforces stats" });
  }
}
async function getCodechefStats(req, res, next) {
  try {
    const username = req.userData?.codechef_id;
    if (!username) {
      return res.status(400).json({ error: "CodeChef ID not provided" });
    }

    const response = await fetch(`https://codechef-api.vercel.app/handle/${username}`);
    const data = await response.json();
    console.log(data);

    if (!data || data.status !== 200) {
      return res.status(404).json({ error: "CodeChef user not found or API error" });
    }

    const userData = data;

    // 1. Contest History
    const contestHistory = userData.ratingData?.map(c => ({
      contestCode: c.code,
      name: c.name,
      rank: c.rank,
      rating: c.rating,
    })) || [];

    // 2. Solved Problems
    const solvedProblems = userData.solved || [];
    const uniqueSolvedSet = new Set();

    const topicWiseCount = {};
    const difficultyBuckets = {};

    for (const problem of solvedProblems) {
      const { name, tags = [], difficulty = "" } = problem;
      if (!name || uniqueSolvedSet.has(name)) continue;
      uniqueSolvedSet.add(name);

      for (const tag of tags) {
        topicWiseCount[tag] = (topicWiseCount[tag] || 0) + 1;
      }

      if (difficulty) {
        difficultyBuckets[difficulty] = (difficultyBuckets[difficulty] || 0) + 1;
      }
    }

    res.json({
      contestHistory,
      topicWiseCount,
      difficultyWiseCount: difficultyBuckets,
      totalSolved: uniqueSolvedSet.size,
    });

  } catch (err) {
    console.error("Error fetching CodeChef stats:", err);
    res.status(500).json({ error: "Failed to fetch CodeChef stats" });
  }
}





// ------------------- Local Helper Methods --------------------

async function fetchContestRatingslc(username) {
    const query = `
    query userContestRankingInfo($username: String!) {
        userContestRankingHistory(username: $username) {
            attended
            rating
            contest {
                title
                startTime
            }
        }
    }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { username } })
    });

    const data = await response.json();
    const allContests = data.data.userContestRankingHistory || [];

    // 🔍 Filter only attended contests
    const attendedContests = allContests.filter(contest => contest.attended === true);

    return attendedContests;
}

async function fetchDifficultyStatslc(username) {
    const query = `
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
    }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { username } })
    });

    const data = await response.json();
    return data.data.matchedUser.submitStats.acSubmissionNum.map(item => ({
        difficulty: item.difficulty,
        count: item.count
    }));
}

async function fetchTopicStatslc(username) {
    const query = `
    query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
            tagProblemCounts {
                advanced {
                    tagName
                    problemsSolved
                }
                intermediate {
                    tagName
                    problemsSolved
                }
                fundamental {
                    tagName
                    problemsSolved
                }
            }
        }
    }`;

    const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { username } })
    });

    const data = await response.json();
    const tagData = data.data.matchedUser.tagProblemCounts;
    const allTags = [...tagData.fundamental, ...tagData.intermediate, ...tagData.advanced];
    return allTags.filter(tag => tag.problemsSolved > 0);
}


async function getContestHistory(username) {
  try {
    const response = await fetch(`https://geeks-for-geeks-api.vercel.app/${username}`);
    if (!response.ok) throw new Error('Failed to fetch contest history');
    const data = await response.json();
    const history = data?.contestRatings || [];

    return history.map((entry, i) => ({
      contest: entry.contestName || `Contest ${i + 1}`,
      rating: entry.rating,
      rank: entry.rank,
      date: entry.date || null
    }));
  } catch (err) {
    console.error('Contest History Error:', err.message);
    return [];
  }
}

async function getSolvedByDifficulty(username) {
  try {
    const response = await fetch(`https://geeks-for-geeks-api.vercel.app/${username}`);
    if (!response.ok) throw new Error('Failed to fetch solved difficulty data');
    const data = await response.json();

    return {
      easy: data?.easySolved || 0,
      medium: data?.mediumSolved || 0,
      hard: data?.hardSolved || 0
    };
  } catch (err) {
    console.error('Solved by Difficulty Error:', err.message);
    return { easy: 0, medium: 0, hard: 0 };
  }
}

async function getSolvedByTopic(username) {
  try {
    const response = await fetch(`https://geeks-for-geeks-api.vercel.app/${username}`);
    if (!response.ok) throw new Error('Failed to fetch solved topic data');
    const data = await response.json();
    const topicsData = data?.topicWise || {};

    const solvedTopics = {};
    ALL_TOPICS.forEach(topic => {
      solvedTopics[topic] = topicsData[topic]?.solved || 0;
    });

    return solvedTopics;
  } catch (err) {
    console.error('Solved by Topic Error:', err.message);
    // Return all topics with 0 solved if error
    return ALL_TOPICS.reduce((acc, topic) => {
      acc[topic] = 0;
      return acc;
    }, {});
  }
}

module.exports = {
     getLeetcodeStats,
     getGFGStats,
     getCodeforcesStats,
     getCodechefStats
};
