---
name: find-component
description: Use before building a new UI component, or when the user asks which component fits a need or whether their library already has one.
---

# Find a component

The library is at `/Users/aliakseych/Projects/components`.

1. Search `catalog/index.json` using the need, its `tags` map, and each component's `summary`, `useWhen` and `avoidWhen`. Only the tags in that map exist, so don't search for others.
   If the need is a whole screen, start from the matching block in the `blocks` list and choose one option per slot.
2. Remove matches whose `avoidWhen` applies or whose `status` is `deprecated`.
3. Look at the desktop and mobile previews of up to three remaining matches. Use the theme the target app uses.
4. Check that each match's dependencies suit the target project. A match with `install` in its metadata can be added with the shadcn CLI; say so in the recommendation.
5. Recommend one component, with the reason it fits and any adaptation it needs. Mention close alternatives briefly.

If nothing fits, say so plainly. Don't stretch a poor match.
