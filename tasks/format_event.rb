#!/usr/bin/ruby
# Takes information from config and populates it into the event HTML
require 'yaml'
require 'uri'
require 'icalendar'
require 'securerandom'
require 'date'
require 'fileutils'

config = YAML.load_file('_config.yml')
template = File.open('templates/event_template.html')
parser = URI::Parser.new
event_text = template.read

# Set event title
event_text.gsub!("<!-- title -->", config["howm"]["title"]["text"])
# Set event title description
event_text.gsub!("<!-- title_description -->", config["howm"]["title"]["description"])
# Set event details description
event_text.gsub!("<!-- details_description -->", config["howm"]["details_description"])

# Set event location values
event_text.gsub!("<!-- address_street -->", config["howm"]["location"]["street"])
location_city_string = "#{config["howm"]["location"]["city"]}, #{config["howm"]["location"]["state"]} #{config["howm"]["location"]["zip_code"]}"
event_text.gsub!("<!-- address_city-state-zip -->", location_city_string)
event_text.gsub!("<!-- map_url -->", config["howm"]["location"]["map_url"])

# Set event time values
event_text.gsub!("<!-- time_description -->", config["howm"]["time"]["description"])

# Create Google Calendar link
location_string = "#{config["howm"]["location"]["street"]}, #{location_city_string}"

date_values = {
  start: [
    config["howm"]["time"]["start"]["year"],
    config["howm"]["time"]["start"]["month"],
    config["howm"]["time"]["start"]["day"],
    config["howm"]["time"]["start"]["hour"],
    config["howm"]["time"]["start"]["minute"],
    00,
  ],
  end: [
    config["howm"]["time"]["end"]["year"],
    config["howm"]["time"]["end"]["month"],
    config["howm"]["time"]["end"]["day"],
    config["howm"]["time"]["end"]["hour"],
    config["howm"]["time"]["end"]["minute"],
    00,
  ]
}

date_string =
  if config["howm"]["time"]["all_day_bool"]
    start_date = Date.new([date_values[:start][0..2]]).strftime("%Y%m%d")
    end_date = Date.new([date_values[:end][0..2]]).strftime("%Y%m%d")
    "#{start_date}/#{end_date}"
  else
    start_date = Time.new(*date_values[:start].compact).utc.strftime("%Y%m%dT%H%M%SZ")
    end_date = Time.new(*date_values[:end].compact).utc.strftime("%Y%m%dT%H%M%SZ")
    "#{start_date}/#{end_date}"
  end

google_event_url = "https://www.google.com/calendar/render?action=TEMPLATE" +
  "&text=#{parser.escape(config["howm"]["title"]["text"])}" +
  "&details=#{parser.escape(config["howm"]["details_description"])}" +
  "&location=#{parser.escape(location_string)}" +
  "&dates=#{date_string}"

event_text.gsub!("<!-- google_event_url -->", google_event_url)

# delete files in event_files
system("rm -rf event_files/*")

# create ical file
ical = Icalendar::Calendar.new
event = Icalendar::Event.new
event.dtstart = DateTime.new(*date_values[:start].compact)
event.dtend = DateTime.new(*date_values[:end].compact)
event.created = DateTime.now
event.location = location_string
event.summary = config["howm"]["title"]["text"]
event.description = config["howm"]["details_description"]
ical.add_event(event)
cryptographic_path = SecureRandom.urlsafe_base64(28)
event_file_path = "event_files/#{cryptographic_path}/event.ics"
FileUtils.makedirs("event_files/" + cryptographic_path)
File.write(event_file_path, ical.to_ical)
event_text.gsub!("<!-- event_file_path -->", event_file_path)

# Set event contact values
event_text.gsub!("<!-- contact_description -->", config["howm"]["contact"]["description"])
event_text.gsub!("<!-- sms -->", config["howm"]["contact"]["sms"].to_s)
event_text.gsub!("<!-- phone -->", config["howm"]["contact"]["phone"].to_s)
event_text.gsub!("<!-- email_address -->", config["howm"]["contact"]["email"]["from"])
event_text.gsub!("<!-- email_subject -->", parser.escape(config["howm"]["contact"]["email"]["subject"]))

File.write("current_event.html", event_text)

# create css based on tailwind classes actually being used
# JEKYLL_ENV=production NODE_ENV=production npx postcss assets/css/main.scss --o assets/main.scss
