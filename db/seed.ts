import { db, Users, Works } from "astro:db";

export default async function() { 
  await db.insert(Users).values([
    { id: 1, userDid: "test" },
    { id: 2, userDid: "another" },
  ]);

  await db.insert(Works).values([
    { 
      author: "test", 
      title: "Hey there title",
      content: "<p>i have evil html</p>",
      tags: [{ label: "test", url: "#" }],
    },
    { 
      author: "another", 
      title: "Hello world",
      content: "<p>whoag i have <b>BOLD</b></p>",
      tags: [{ label: "label", url: "#" }],
    },
  ]);
}