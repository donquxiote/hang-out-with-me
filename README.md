# Hang Out With Me

A single use website for private event information run on [Jekyll](https://jekyllrb.com/) and designed to be hosted on Github Pages.

## Installation

### Prerequisites

1. Have Ruby and Bundler Installed. To install ruby follow the instructions [here.](https://www.ruby-lang.org/en/documentation/installation/)

    Then install bundler:

    ```bash
    gem install bundler
    ```

2. Have NPM and Node Installed. Instructions can be found [here.](https://www.npmjs.com/get-npm)

### Installing the theme

There are two ways you can host this site in github, as a private or a public repo. I recommend hosting in a private repo, so you can commit and backup your `_events` folder.

If you choose to host in a public repo, you can add the `_events` directory to your `.gitignore` and not commit any private information.

To copy to a private repo, you will need to duplicate this repo. [Github has pretty clear steps here.](https://help.github.com/articles/duplicating-a-repository/)

If you are using a public repo, simply fork this repo to your account.

Once you have the repo, run these commands:

```bash
git pull https://github.com/YOUR-USERNAME/hang-out-with-me.git

cd hang-out-with-me/

bundle install

npm install
```

This will download your copy of the repo, then install the required gems, and then the required packages.

## Configuration

Edit the information which will be encrypted in `current.md`. Site configuration information goes into `_config.yml` like any other Jekyll site.

## Encrypting an event

Run these commands to encrypt your event with a password:

```bash
cd hang-out-with-me/

npx gulp --password "super-secure-password" --event-create t
```

Then commit your change and push.

## Publish to Github Pages

Once you've committed your encrypted event and pushed it, you can publish the site. Github's own documentation on this is pretty straight forward and [available here.](https://help.github.com/categories/github-pages-basics/)

---

## Why

When I deleted my facebook account, one of the issues I knew I'd have would be getting event or party info out en masse to my friends. Evites can be cumbersome and often require knowing people's email, or them checking their email and fighting with spam folders. Group texts are clumsily, everyone is on a dozen different messaging apps but no one has the same combination. The most accessible and easy to use (for the invitees) option seemed to be an easily simple website.

My goal was something that was minimal work on my the attendee side, that could be shared with a link and a quick blurb.

This template provides these key elements:

- Simple, mobile responsive single page layout
- Encrypted content hidden behind a password of your choice
- Single editable content page
- Designed to be hosted on github pages, the only cost you should incur is a domain name if you want one.

## How It Works

Your event information is put into the `current.md` file. The gulp tasks will only read that file, encrypt its contents, and then put the encrypted hash into your configuration file. (This allows you to save past events in the `_events` directory.) You then push your change to github pages, and your event is now hosted behind a password.

## Generating Calendar Events

This theme now has the ability to generate a link for Google Calendar, and a file for Apple calendar, so your event can easily be added to an attendees calendar app of choice. To do this, populate the `eventData.json` file, and pass the flag `--event-create t` when running the gulp command. If you pass that flag with the argument `f`, the event file/link section will be hidden in the final page.

### Security caveats

This is not foolproof information protection and should not be used for anything truly sensitive. This is only to prevent the most opportunistic from retrieving your event information. If you choose to create the calendar files, those are stored in a folder whose path is a random, 28 characters in length, cryptographically strong string.

## TO DO

This project is far from complete, here are the current enhancement issues to be looked at:

- [Theme Gemmification](https://github.com/donquxiote/hang-out-with-me/issues/3)

If you have a suggestion open an issue or a pull request.

## Thanks To

Using javascript encryption in a Jekyll blog was originally pulled from [Lllychen's jekyll-firewall theme.](https://github.com/lllychen/jekyll-firewall) The inspiration for a single page/simple jekyll site came from [Excentris' Compass theme](https://github.com/excentris/compass). Thanks to both of them for making those projects so that I could mash them together.
