# Fanfics on AtProto

Links:
- [Background](#background)
- [Infrastructure](#infrastructure)
  - [Notes](#notes)
  - [Structure](#structure)
- [Contributing](#contributing)
- [Support](#support)

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

##### Styles (AKA, abomination)

This is the most messed up design system but I sure tried my best with it. The base style uses [daisyui](https://daisyui.com/docs/) and [UnoCSS](https://unocss.dev/guide/), which means the configurations are Strange(tm). Beware of `uno.config.ts`, please don't poke it too hard unless you know what you're doing.

This uses CSS layers to make things work. Any styles used in `base.css` will overwrite everything else across the entire site. This should only be modified sparingly.

All styling should be *within* components or pages via HTML classes or within scoped `<style>` blocks. There are various colors and sizes to keep track of - at some point, I'll document them.

To make contribute new themes, check out the examples inside the `src/assets/styles/themes` folder. You can use the [daisyui Theme Generator](https://daisyui.com/theme-generator/) to quickly build a theme!

#### Components: `src/components` 

These hold components that are reused throughout `src/pages`. Like PHP includes but in HTML and JavaScript (well, technically it's JSX).

#### Pages: `src/pages` 

These are the actual routes that are available to end-users. Under the pages are nested pages grouped under folders, namely:

##### Users: `src/pages/users`

These are pages where users can view all user profiles, find a specific user profile, or update their account settings.

##### Works: `src/pages/works`

These only hold pages that are relevant to adding, editing, deleting, or viewing works.

## Contributing

The instructions may change in the future in case the development workflow changes. Please feel free to [report an issue](/issues) if you come across any during development or building.

### Prerequisites

- Git
- Node.js
  - `v18.20.8` or `v20.3.0`, `v22.0.0` or higher. (`v19` and `v21` are not supported.)
- `npm` or similar package manager

> [!IMPORTANT]
> Running this with `deno` does not work. You'll get an "Unsupported key curve for this operation" error when running the project and testing OAuth. See [this issue](https://github.com/panva/jose/discussions/740).

### Instructions

1. Clone the repo to your system using the following command:
```bash
git clone https://github.com/haetae-bit/fanfic-atproto
```
2. Use whatever runtime you use to install packages: 
```bash
npm install
```
3. To run the development server, use this command: 
```bash
npm run dev
```

> [!NOTE]  
> If you are not using pnpm, delete the pnpm-lock.yaml and pnpm-workspace.yaml files before installing packages, or there will be conflicts and your config files will not work correctly

## Support

If you want to support me making making this, please feel free to donate a coffee.

<a href="https://buymeacoffee.com/haetae" target="_blank" referrerpolicy="no-referrer">
  <img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="buy me a coffee" />
</a>
