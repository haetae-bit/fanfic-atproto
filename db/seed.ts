import { Chapters, db, Users, Works } from "astro:db";

export default async function() { 
  await db.insert(Users).values([
    { id: 1, userDid: "test", nickname: "cool" },
    { id: 2, userDid: "another", nickname: "hi" },
    { userDid: "did:plc:dg2qmmjic7mmecrbvpuhtvh6", nickname: "haetae" },
  ]);

  await db.insert(Works).values([
    {
      slug: "1234",
      author: "test", 
      title: "Hey there title",
      summary: "<p>i have evil html</p>",
      tags: [{ label: "test", url: "#" }],
    },
    { 
      slug: "1235",
      author: "another", 
      title: "Hello world",
      summary: "<p>whoag i have <b>BOLD</b></p>",
      tags: [{ label: "label", url: "#" }],
    },
    {
      uri: "at://did:plc:dg2qmmjic7mmecrbvpuhtvh6/moe.fanfics.works/3lyeiyq32ek2o",
      slug: "1236",
      author: "did:plc:dg2qmmjic7mmecrbvpuhtvh6",
      title: "testing title",
      summary: "what's up?! <b>bold</b> and <em>italics</em> should work.",
      tags: "hey",
    }
  ]);

  await db.insert(Chapters).values([
    {
      workId: 1,
      order: 1,
      title: "chapter title 1",
      content: "what's up?! <b>bold</b> and <em>italics</em> should work.",
    },
    {
      workId: 2,
      order: 1,
      title: "chapter title 2",
      content: "test",
    },
    {
      workId: 3,
      order: 1,
      title: "at proto",
      content: "what's up?! <b>bold</b> and <em>italics</em> should work.",
    }
  ]);
}