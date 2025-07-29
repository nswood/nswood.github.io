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

{% for post in site.publications
     | sort: "date"
     | reverse
     limit:3 %}
- [{{ post.title }}]({{ post.url }}) ({{ post.date | date: "%Y" }})
{% endfor %}


## Recent Talks
{% for post in site.talks
     | sort: "date"
     | reverse
     limit:3 %}
- [{{ post.title }}]({{ post.url }}) ({{ post.date | date: "%Y" }})
{% endfor %}
