---
permalink: /
title: "Nate Woodward"
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

I am a PhD student at the University of Wisconsin–Madison, where I develop machine learning techniques for theoretical physics. My current research focuses on symbolic reasoning methods for theoretical physics.

I graduated from MIT in 2025 with degrees in Physics and Mathematics. During my undergraduate studies I worked in Professor Phil Harris's group and with the NSF AI Institute for Artificial Intelligence and Fundamental Interactions (IAIFI), building ML tools for high‑energy physics. My experience spans geometric ML for jet physics, detector readout algorithms, and theoretical QFT calculations.

## Recent Publications

{% comment %}
  1. Sort ascending by date → oldest→newest
  2. Reverse the array        → newest→oldest
  3. Then take limit:3         → three newest, in descending order
{% endcomment %}

{% assign sorted_pubs = site.publications 
     | sort: "date"    /* oldest→newest */
     | reverse         /* newest→oldest */ %}

{% for post in sorted_pubs limit:3 %}
- [{{ post.title }}]({{ post.url }}) ({{ post.date | date: "%Y" }})
{% endfor %}

## Recent Talks
{% assign sorted_pubs = site.talks 
     | sort: "date"    /* oldest→newest */
     | reverse         /* newest→oldest */ %}

{% for post in sorted_pubs limit:3 %}
- [{{ post.title }}]({{ post.url }}) ({{ post.date | date: "%Y" }})
{% endfor %}
