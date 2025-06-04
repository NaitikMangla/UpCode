const fetch = require('node-fetch');


async function getLeetcodeStats(req, res, next) {
    try {
        const userData = req.userData;
        const leetcodeUsername = userData.leetcode_id;
        const verified = userData.isleetcodeVerified
        
        if(!leetcodeUsername || !verified)
        {
          return res.status(400).json({error : "null or unverified credentials"})
        }

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
      console.log(err.message);
      return res.status(500).json({error : "Server Internal Error"})
    }
}

async function getGFGStats(req, res, next) {
  const username = req.userData?.gfg_id;
  const verified = req.userData?.isgfgVerified
  if (!username || !verified) return res.status(400).json({ error: 'null or unverified credentials' });

  try {
    const [solvedByDifficulty, ratingHistory] = await Promise.all([
      getSolvedByDifficultygfg(username),
      getContestHistorygfg(username),
    ]);

    return res.status(200).json({
      username,
      ratingHistory,
      solvedByDifficulty,
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
    const { codeforces_id , iscodeforcesVerified } = req.userData;
    if(!codeforces_id || !iscodeforcesVerified)
    {
      return res.status(400).json({ error: 'null or unverified credentials' });
    }

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
    const verified = req.userData?.iscodechefVerified;
    if (!username || !verified) {
      return res.status(400).json({ error: "CodeChef ID not provided" });
    }

    const response = await fetch(`https://codechef-api.vercel.app/handle/${username}`);
    const data = await response.json();

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

    try{
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
    catch(err)
    {
      return {error : "LC contest ratings couldn't be processed"}
    }
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

    try{
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
    catch(err){
    return {error : "LC difficulty wise data couldn't be fetched"}
    }
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

    try {
        const response = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { username } })
      });

      const data = await response.json();
      const tagData = data.data.matchedUser.tagProblemCounts;
      const allTags = [...tagData.fundamental, ...tagData.intermediate, ...tagData.advanced];
      return allTags.filter(tag => tag.problemsSolved > 0);
    } catch (err) {
      return {error : "LC topic-wise data couldn't be fetched"}
    }
}


async function getContestHistorygfg(username) {
  try {
    const response = await fetch(`https://mygfg-api.vercel.app/${username}/contest`);
    if(!response.ok) throw new Error('Failed to fetch solved gfg Contest History')
    const data = await response.json();
    const contestCount = data["Contest Data"]["Total Contests"]
    const history = data["Contest Details"].map((c) => {
      return {
        contestName : c.slug,
        contestStartTime : c.start_time,
        rank : c.rank,
        ratingChange : c.rating_change,
        displayRating : c.display_rating
      }
    })

    return {
      contestCount , history
    }
    
  } catch (err) {
    return {error : "GFG contest history couldn'tbe fetched"}
  }
}

async function getSolvedByDifficultygfg(username) {
  try {
    const response = await fetch(`https://geeks-for-geeks-api.vercel.app/${username}`);
    if (!response.ok) throw new Error('Failed to fetch solved difficulty data');
    const data = await response.json();

    return {
      displayName : data["info"]["fullname"],
      institute : data["info"]["institute"],
      total : data["info"]["totalProblemsSolved"],
      easy: data?.solvedStats?.easy.count || 0,
      medium: data?.solvedStats?.medium.count || 0,
      hard: data?.solvedStats?.hard.count || 0
    };
  } catch (err) {
    return {error : "GFG difficulty wise data couldn't bew fetched"}
  }
}


module.exports = {
     getLeetcodeStats,
     getGFGStats,
     getCodeforcesStats,
     getCodechefStats
}
