# Live.get_step()

Returns the current `step` value.

```py
def get_step() -> int:
```

#### Usage:

```py
from dvclive import Live

live = Live()

while live.get_step() < 3:
    live.log("metric", 0.9)
    live.next_step()
```

## Description

DVCLive uses `step` to track the progress of each metric logged with
`Live.log()`.

The `step` value can be updated with `Live.next_step()` or `Live.set_step()`.
