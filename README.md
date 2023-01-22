# Hang Out With Me

A single use website for private event information run on [Jekyll](https://jekyllrb.com/) and designed to be hosted on Github Pages. Example site is available at [https://donquxiote.github.io/hang-out-with-me/](https://donquxiote.github.io/hang-out-with-me/) with the password `my_password`

## Installation

### Prerequisites

[Install asdf](https://asdf-vm.com/guide/getting-started.html)

### Installing the theme

```bash
# 1. Fork this repo or duplicate it to your own private version
# 2. Clone from github
# 3. cd into the project directory
# 4. Install dependencies

asdf install

bundle install

npm install
```

There are two ways you can host this site in github, as a private or a public repo. I recommend hosting in a private repo, so you can commit and backup your `_events` folder.

If you choose to host in a public repo, you can add the `_events` directory to your `.gitignore` and not commit any private information.

To copy to a private repo, you will need to duplicate this repo. [Github has pretty clear steps here.](https://help.github.com/articles/duplicating-a-repository/)

If you are using a public repo, simply fork this repo to your account.

Once ready, follow these steps:

## 1. Configure your Site and Populate your Event

Save event info in `howm` section of `_config.yml`
Site configuration information goes into `_config.yml` like any other Jekyll site.

`bundle exec jekyll serve` to run site

## 2. Populate event html

`ruby tasks/format_event.rb` reads config and populates html with that information

## 3. Encrypt your event

`ruby tasks/encrypt_event.rb my_password` encrypts the event with your password and saves the encrypted html into `index.html`

Then commit your change and push.

## 4. Publish to Github Pages

The [included Github action](https://github.com/jeffreytse/jekyll-deploy-action) will publish the site to the `gh-pages` branch when you push to your `main` branch. You will need to create an empty `gh-pages` branch if you don't have one.

---

## Why

When I deleted my facebook account, one of the issues I knew I'd have would be getting event or party info out en masse to my friends. Evites can be cumbersome and often require knowing people's email, or them checking their email and fighting with spam folders. Group texts are clumsily, everyone is on a dozen different messaging apps but no one has the same combination. The most accessible and easy to use (for the invitees) option seemed to be a simple website.

My goal was something that was minimal work on my the attendee side, that could be shared with a link and a quick blurb.

This template provides these key elements:

- Simple, mobile responsive single page layout
- Encrypted content hidden behind a password of your choice
- Single editable content page
- Designed to be hosted on github pages, the only cost you should incur is a domain name if you want one.

### Security caveats

This is not foolproof information protection and should not be used for anything truly sensitive. This is only to prevent the most opportunistic from retrieving your event information. If you choose to create the calendar files, those are stored in a folder whose path is a random, 28 characters in length, cryptographically strong string.

If you have a suggestion open an issue or a pull request.

## Thanks

Refactored to update Jekyll and use [PageCrypt](https://github.com/Greenheart/pagecrypt) and Github actions. Originally this project started as an adaptation of [Lllychen's jekyll-firewall theme.](https://github.com/lllychen/jekyll-firewall) The inspiration for a single page/simple jekyll site came from [Excentris' Compass theme](https://github.com/excentris/compass).
