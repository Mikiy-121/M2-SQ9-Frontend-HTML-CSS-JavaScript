// 4. Fetch a list from a public API, then use Promise.all to fetch
//    details for the first two items in parallel.

async function fetchFirstTwoPostAuthors() {
  const listRes = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!listRes.ok) {
    throw new Error(`List fetch failed: ${listRes.status}`);
  }
  const posts = await listRes.json();
  const firstTwo = posts.slice(0, 2);

  // Fire both detail requests together, wait for both to finish.
  const details = await Promise.all(
    firstTwo.map(async (post) => {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${post.userId}`);
      if (!res.ok) {
        throw new Error(`User fetch failed: ${res.status}`);
      }
      const user = await res.json();
      return { postId: post.id, title: post.title, author: user.name };
    })
  );

  return details;
}

fetchFirstTwoPostAuthors()
  .then((details) => console.log(details))
  .catch((err) => console.error('Failed:', err.message));
