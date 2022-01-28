# 🔮 Chaos Genius Contribution Guidelines

## Git best practices

### Commit message format

We will use Semantic Commit Messages, that are an adoption of Conventional Commits:

feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.

#### Description of each commit type:

1. feat: (new feature for the user, not a new feature for build script)
2. fix: (bug fix for the user, not a fix to a build script)
3. docs: (changes to the documentation)
4. style: (formatting, missing semi colons, etc; no production code change)
5. refactor: (refactoring production code, eg. renaming a variable)
6. test: (adding missing tests, refactoring tests; no production code change)
7. chore: (updating grunt tasks etc; no production code change)

Please look into Semantic Commit’s references for more information. 

#### A good thumb rule:

Commit message should talk about WHAT changed, and WHY. Not HOW – how is the diff, and you don’t need to repeat it.

### Issue linking

Every commit in any branch should be linked to an issue. If no relevant issue exists, please ask Harshit or Manas to create it.


### How to setup locally for development

- git clone
- install the prerequisite
- set the variable in the `.env.local` (This file will override all the environment variables)
- run `bash dev_server.sh` to run the local server
