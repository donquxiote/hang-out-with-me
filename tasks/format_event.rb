#!/usr/bin/ruby
# Takes information from config and populates it into the event HTML
require 'yaml'
require 'uri'
require 'icalendar'

config = YAML.load_file('_config.yml')
template = File.open('templates/event_template.html')
parser = URI::Parser.new
event_text = template.read

# Set event title
event_text.gsub("<!-- title -->", config["howm"]["title"]["text"])
# Set event title description
event_text.gsub("<!-- title_description -->", config["howm"]["title"]["description"])
# Set event details description
event_text.gsub("<!-- details_description -->", config["howm"]["details_description"])

# Set event location values
event_text.gsub("<!-- address_street -->", config["howm"]["location"]["street"])
location_city_string = "#{config["howm"]["location"]["city"]}, #{config["howm"]["location"]["state"]} #{config["howm"]["location"]["zip_code"]}"
event_text.gsub("<!-- address_city-state-zip -->", location_city_string)

# Set event time values
event_text.gsub("<!-- time_description -->", config["howm"]["time"]["description"])

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
    config["howm"]["time"]["start"]["timezone"]
  ],
  end: [
    config["howm"]["time"]["end"]["year"],
    config["howm"]["time"]["end"]["month"],
    config["howm"]["time"]["end"]["day"],
    config["howm"]["time"]["end"]["hour"],
    config["howm"]["time"]["end"]["minute"],
    00,
    config["howm"]["time"]["end"]["timezone"]
  ]
}

date_string =
  if config["hown"]["time"]["all_day_bool"]
    start_date = Date.new([date_values.start[0..2]]).strftime("%Y%m%d")
    end_date = Date.new([date_values.end[0..2]]).strftime("%Y%m%d")
    "#{start_date}/#{end_date}"
  else
    start_date = Time.new(*date_values.start.compact).utc.strftime("%Y%m%dT%H%M%SZ")
    end_date = Time.new(*date_values.start.compact).utc.strftime("%Y%m%dT%H%M%SZ")
  end

google_event_url = "https://www.google.com/calendar/render?action=TEMPLATE" +
  "&text=#{parser.escape(config["howm"]["title"]["text"])}" +
  "&details=#{parser.escape(config["howm"]["details_description"])}" +
  "&location=#{parser.escape(location_string)}" +
  "&dates=#{date_string}"

event_text.gsub("<!-- google_event_url -->", google_event_url)

# create ical file
event_file =
File.mkdir # make cryptographic path name
File.write("event_files/#{cryptographic_path}/event.ics", event_file)
event_text.gsub("<!-- event_file_path -->", event_file_path)

# Set event contact values
event_text.gsub("<!-- contact_description -->", config["howm"]["contact"]["description"])
event_text.gsub("<!-- sms -->", config["howm"]["contact"]["sms"])
event_text.gsub("<!-- phone -->", config["howm"]["contact"]["phone"])
event_text.gsub("<!-- email_address -->", config["howm"]["contact"]["email"]["from"])
event_text.gsub("<!-- email_subject -->", config["howm"]["contact"]["email"]["subject"])

File.write("current_event.html", event_text)
