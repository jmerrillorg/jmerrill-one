# Master Social Destination Rule

A master connector containing multiple authorized JM1 assets is not itself a defect.

For master-connected platforms, execution authority is controlled by the destination selected for each post.

For the current One pilot:

```text
Facebook
Master connector
    ↓
SELECT: J Merrill One
    ↓
schedule/publish

LinkedIn Organization
Master connector
    ↓
SELECT: J Merrill One
    ↓
schedule/publish

Instagram
DIRECT: @jmerrillone
    ↓
schedule/publish
```

If the post composer does not clearly show the required One destination, do not schedule or publish that item.
