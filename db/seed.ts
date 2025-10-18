import { Chapters, db, Tags, Users, Works } from "astro:db";

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
      tags: [{ label: "test", slug: "#", type: "character" }],
    },
    { 
      slug: "1235",
      author: "another", 
      title: "Hello world",
      summary: "<p>whoag i have <b>BOLD</b></p>",
      tags: [{ label: "label", slug: "#", type: "relationship" }, { label: "label", slug: "#", type: "character" }],
      draft: false
    },
    {
      uri: "at://did:plc:dg2qmmjic7mmecrbvpuhtvh6/moe.fanfics.works/3lyeiyq32ek2o",
      slug: "1236",
      author: "did:plc:dg2qmmjic7mmecrbvpuhtvh6",
      title: "testing title",
      summary: "what's up?! <b>bold</b> and <em>italics</em> should work.",
      tags: "hey",
      draft: false
    }
  ]);
  
  await db.insert(Chapters).values([
    {
      workId: 1,
      slug: `${new Date().valueOf().toString()}-1`,
      title: "chapter title 1",
      content: "what's up?! <b>bold</b> and <em>italics</em> should work.",
    },
    {
      workId: 2,
      slug: `${new Date().valueOf().toString()}-2`,
      title: "chapter title 2",
      content: "test",
    },
    {
      workId: 3,
      slug: `${new Date().valueOf().toString()}-3`,
      title: "at proto",
      content: "what's up?! <b>bold</b> and <em>italics</em> should work.",
    }
  ]);

  await db.insert(Tags).values([
    {
      type: "warnings",
      slug: "warning:noncon",
      label: "Non-con",
    },
    {
      type: "warnings",
      slug: "warning:dead-dove",
      label: "Dead Dove: Do not eat",
    },
    {
      type: "character",
      slug: "character:till",
      label: "Till",
    },
    {
      type: "character",
      slug: "character:ivan",
      label: "Ivan",
    },
    {
      type: "character",
      slug: "character:mizi",
      label: "Mizi",
    },
    {
      type: "character",
      slug: "character:sua",
      label: "Sua",
    },
    {
      type: "relationship",
      slug: "ship:mizi-sua",
      label: "Mizi/Sua",
    },
    {
      type: "relationship",
      slug: "ship:till-ivan",
      label: "Till/Ivan",
    },
    {
      type: "series",
      slug: "series:alien-stage",
      label: "Alien Stage"
    },
  ]);
}