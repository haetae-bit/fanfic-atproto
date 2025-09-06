# Fanfics on AtProto

Links:
- [Background](#background)
- [Infrastructure](#infrastructure)
  - [Notes](#notes)
  - [Structure](#structure)
- [Contributing](#contributing)

> [!WARNING]
> This is alpha software, there's no guarantee that this will work on your system. But if you'd like to try hacking at this, take a look at the [Contributing](#contributing) section once instructions are written up.

## Background

This was an idea that sparked off a great discussion around decentralizing archives for fanfics and fan works. What if we could have archives that:

1. ... are censorship resistant,
2. ... are easy (and CHEAP) to host,
3. ... are easy to configure and extend,
4. ... have moderation tools built-in,
5. ... give users on both sides (authors AND readers) more ownership over their data,
6. ... AND have a cool sixth thing here!

I'm setting out to explore these questions by building a prototype of a fanfic archive on Astro and AtProto.

## Infrastructure

### Notes

AtProto, to my understanding, is made of multiple layers. There's:

1. The client (the actual site that displays data)
2. The PDS (the server that stores user's data)
3. The AppView (the thing that grabs only relevant data and serves as an API)
4. The Lexicon (the blueprint for data to be used in AppViews and clients)

... And probably more, and there's a lot of discussion around how user data ownership / censorship / etc gets handled on those layers.

In our case, we'll only worry about making the client and then get drafts of the lexicons from the community later.

Currently, I'm using these technologies:

- Astro
- Drizzle ORM (via Astro DB)
  - Turso (LibSQL under the hood)
- Unstorage (via [@fujocoded/authproto](https://github.com/FujoWebDev/fujocoded-plugins/tree/main/astro-authproto))

Mainly because: 1, Astro is a really well-documented web framework that's pretty approachable as someone who used to handwrite HTML pages; 2, SQLite / LibSQL are (to my knowledge) fairly cheap databases to run; and 3, Unstorage is pretty dead simple for setting up auth sessions from scratch.

### Structure

#### Database: `db` 

This holds all the relevant database code. This also contains the structure and types for database tables.

#### Actions: `src/actions`

These hold actions that run every time a user wants to publish a new work or signs up for the archive. Basically the backend functionality for this project.

#### Assets: `src/assets` 

This has images / libre font / `.css` files to be used stylistically throughout the site.

#### Components: `src/components` 

These hold components that are reused throughout `src/pages`. Like PHP includes but in HTML and JavaScript (well, technically it's JSX).

#### Pages: `src/pages` 

These are the actual routes that are available to end-users. Under the pages are nested pages grouped under folders, namely:

##### Users: `src/pages/users`

These are pages where users can view all user profiles, find a specific user profile, or update their account settings.

##### Works: `src/pages/works`

These only hold pages that are relevant to adding, editing, deleting, or viewing works.

## Contributing

To be added, but feel free to open an issue in the meantime!