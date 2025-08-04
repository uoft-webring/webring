# Welcome to UofT Webring's Contributing Guidelines and Developer Quickstart!

We welcome contribution through pull requests, questions, feature requests as well as bug reports (issues)!

To push changes from a branch, you should first create a fork. This will create your copy of the repo and ensure that you are able to push changes to Github and make PRs.

## Committing Changes and Writing Pull Requests

**Committing changes**

When committing changes please use [semantic commit messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) and describe what the commit changed briefly using.

**Pull Requests**

When making pull requests please provide a descriptive title explaning the overall scope of the PR and provide details in a "description" section.

We do not enforce a PR template to follow but if you are having trouble writing one, here is one you can follow:

```
Closes #{insert ticket number}

## Description
{
            insert more detailed description here,
            explaining what was changed
}

### Missing features
{
        Add all missing features from related tickets here, if any,
        otherwise delete this section
}
```

## Getting Started Locally

First, run the development frontend server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then start the DB locally using the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

**First time using Supabase CLI?** Refer to our [quickstart](supabase/README.md) to get up to speed then refer to Supabase documentation!
