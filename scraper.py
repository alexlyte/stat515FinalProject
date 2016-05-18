from bs4 import BeautifulSoup
from os import listdir
from os import walk
import re
import csv


with open('./beer_restaurants.csv', 'wb') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',', quotechar='\"', quoting=csv.QUOTE_MINIMAL)    
    spamwriter.writerow(["bar_name", "bar_type", "location", "website", "beer_name", "beer_type", "beer_abv", "beer_loc", "beer_qty", "beer_medium", "beer_price"])
    for file in listdir('./html_files/'):
        file_path = './html_files/' + file
        f = open(file_path, 'rw')
        soup = BeautifulSoup(f, 'html.parser')
        bar_title = soup.title.string
        body = soup.body
        # bar_type = soup.title
        if(hasattr(soup.body.contents[3].div.div.h1,'string')):
            bar_name = soup.body.contents[3].div.div.h1.string.lstrip()
        else : 
            bar_name = ''

        if (hasattr(soup.body.contents[3].div.div.p, 'string')):
            bar_type = soup.body.contents[3].div.div.p.string.lstrip()
        else: 
            bar_type = ''

        for child in (soup.body.find_all('a')):
            href = (child.get('href'))
            line = href.rstrip()
            if re.search('maps.google', line):
                location = line.split('https://maps.google.com/maps?q=')[1].encode('utf-8')
            elif re.search('http:\/\/www', line):
                website = line.split('http://')[1]
            elif re.search('\/beers\/', line):
                beer_element = child.parent.parent.parent
                beer_name = beer_element.div.h3.a.contents[0].encode('utf-8')
                if(beer_element.div.p.contents):   
                    # print(beer_element.div.p.contents)     
                    beer_class = beer_element.div.p.contents[0] 
                    beer_class_set = re.split("\xb7 ", beer_class)

                    beer_type = beer_class_set[0].lstrip()

                    if(len(beer_class_set) > 1):
                        beer_abv = beer_class_set[1].encode('utf-8')
                    else: 
                        beer_abv = ""

                    if(len(beer_class_set) > 2):
                        beer_loc = beer_class_set[2].encode('utf-8')
                    else: 
                        beer_loc = ""

                    beer_inf = re.sub(' Pack ','-Pack-',beer_element.contents[3].p.contents[0])
                    beer_info = re.split(" ", beer_inf)

                    beer_qty = beer_info[1].encode('utf-8')
 
                    if(len(beer_info) > 2):
                        beer_medium = beer_info[2].encode('utf-8')
                    else: 
                        beer_medium = ""

                    if(len(beer_info) > 3):
                        beer_price = beer_info[3].encode('utf-8')
                    else: 
                        beer_price = ""

                    # print(beer_name)
                    # print(beer_type)
                    # print(beer_abv)
                    # print(beer_loc)
                    # print(beer_qty)
                    # print(beer_medium)
                    # print(beer_price)
                    # print("\n")
                    csv_line = [bar_name, bar_type, location, website, beer_name, beer_type, beer_abv, beer_loc, beer_qty, beer_medium, beer_price]
                    # print(csv_line)
                    spamwriter.writerow(csv_line)

        # else:        
        #     print(line)
