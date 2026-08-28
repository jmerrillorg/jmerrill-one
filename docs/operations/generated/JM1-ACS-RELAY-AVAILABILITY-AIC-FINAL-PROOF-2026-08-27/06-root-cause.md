# Root Cause

Last verified: 2026-08-28T02:33:47Z

## Classification

`NODE24_LINUX_CONSUMPTION_HOST_UNAVAILABLE`

## Evidence

While configured to `Node|24`, the existing Linux Consumption Function App returned platform-level 503 for all public and SCM routes. ARM still reported the app as `Running`, and the deployment package was reachable and structurally valid.

Changing only the existing Function App runtime stack to `Node|22` changed the public host from platform 503 to a live Functions host. POST requests to relay endpoints then returned governed handler responses.

Package rollback did not repair the 503 while the host remained on the unavailable runtime path, which rules out the latest relay source package as the primary cause.

