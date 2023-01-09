desc 'Populate event page from config'
task :populate_event do
  require 'yaml'
  require 'nokogiri'
  # read config data
  config = YAML.load_file('_config.yml')

  # read html document

  # generate event file on "secure" path

  # replace text in html
end


desc 'Encrypt event page'
task :encrypt_event do
  password = ARGV[1]
  system("npx pagecrypt current_event.html index.html '#{password}'")
end
