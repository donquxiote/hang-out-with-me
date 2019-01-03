# Hang Out With Me

A single use website for private event information run on [Jekyll](https://jekyllrb.com/) and designed to be hosted on Github Pages.

## Why

When I deleted my facebook account, one of the issues I knew I'd have would be getting event or party info out en masse to my friends. Evites can be cumbersome and often require knowing people's email, or them checking their email and fighting with spam folders. Group texts are clumsily, everyone is on a dozen different messaging apps and no one seems to be on the same ones, the best option seemed to be an easily reachable website.

My goal was something that was minimal work on my the attendee side, that could be shared with a link and a quick blurb.

This template provides these key elements:

- Simple, mobile responsive single page layout
- Encrypted content hidden behind a password of your choice
- Single editable content page
- Designed to be hosted on github pages, the only cost you should incur is a domain name if you want one.

## How It Works

Your event information is put into the `current.md` file. The gulp tasks will only read that file, encrypt its contents, and then put the encrypted hash into your configuration file. (This allows you to save past events in the `_events` directory.) You then push your change to github pages, and your event is now hosted behind a password.

### Security caveats

This is not foolproof information protection and should not be used for anything truly sensitive. This is only to prevent the most opportunistic from retrieving your event information.

## Installation

### Prerequisites

1. Have Ruby and Bundler Installed. To install ruby follow the instructions [here.](https://www.ruby-lang.org/en/documentation/installation/)

    Then install bundler:

    ```bash
    $ gem install bundler
    ```

2. Have NPM and Node Installed. Instructions can be found [here.](https://www.npmjs.com/get-npm)

### Installing the theme

There are two ways you can host this site in github, as a private or a public repo. I recommend hosting in a private repo, so you can commit and backup your `_events` folder.

If you choose to host in a public repo, you can add the `_events` directory to your `.gitignore` and not commit any private information.

To copy to a private repo, you will need to duplicate this repo. [Github has pretty clear steps here.](https://help.github.com/articles/duplicating-a-repository/)

If you are using a public repo, simply fork this repo to your account.

Once you have the repo, run these commands:

```bash
$ git pull https://github.com/YOUR-USERNAME/hang-out-with-me.git

$ cd hang-out-with-me/

$ bundle install

$ npm install
```

This will download your copy of the repo, then install the required gems, and then the required packages.

## Configuration

Edit the information which will be encrypted in `current.md`. Site configuration information goes into `_config.yml` like any other Jekyll site.

## Encrypting an event

Edit the `encryptionPassword` variable in `gulpfle.js` to set the password your want your attendees to use. Then run these commands:

```bash
$ cd hang-out-with-me/

$ gulp
```

Then commit your change and push.

## Publish to Github Pages

Once you've committed your encrypted event and pushed it, you can publish the site. Github's own documentation on this is pretty straight forward and [available here.](https://help.github.com/categories/github-pages-basics/)

## TO DO

This project is far from complete, here are the current enhancement issues to be looked at:

- [CSS improvements](https://github.com/donquxiote/hang-out-with-me/issues/1)
- [Liquid templating on encrypted page](https://github.com/donquxiote/hang-out-with-me/issues/2)
- [Theme Gemmification](https://github.com/donquxiote/hang-out-with-me/issues/3)

If you have a suggestion open an issue or a pull request.

## Thanks To

The basic page format and css was shamelessly cribbed from [Excentris' Compass theme](https://github.com/excentris/compass) and the encryption was pulled from [Lllychen's jekyll-firewall theme.](https://github.com/lllychen/jekyll-firewall) Thanks to both of them for making those projects so that I could mash them together.
