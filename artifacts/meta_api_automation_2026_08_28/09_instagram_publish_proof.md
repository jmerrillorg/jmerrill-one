# 09 Instagram Publish Proof

Date: 2026-08-28

Status: pending API proof

## Required Proof

A controlled approved Dataverse record must publish to an Instagram Professional account through the Meta container/publish workflow without browser interaction.

Required stages:

1. Resolve Instagram Professional account.
2. Resolve certified media URL.
3. Create media container.
4. Verify processing state where applicable.
5. Publish container.
6. Capture Instagram media ID.
7. Persist execution result in Dataverse.

## Official Reference

Meta content publishing reference:

- https://developers.facebook.com/documentation/instagram-platform/content-publishing

## Current Manual Bridge Evidence

Meta Business Suite scheduled a Publishing Instagram canary on 2026-08-28 using an exact 1080 x 1080 local file and platform-specific caption, but this is not API proof.
