#!/usr/bin/ruby
password = ARGV[0]
puts "Encrypting event with pagecrypt 🔒"
system("npx pagecrypt current_event.html index.html '#{password}'")
