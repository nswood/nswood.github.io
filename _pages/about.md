---
layout: home
permalink: /
title: ""
author_profile: false
redirect_from:
  - /about/
  - /about.html
---

<div id="quantum-foam-header" style="position: relative; width: 100vw; margin-left: calc(-50vw + 50%); height: 300px; margin-bottom: 0; overflow: visible;">
  <div id="header-text-container" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); background: rgba(26, 26, 46, 0.85); padding: 1em 2em; border-radius: 8px; z-index: 10; border: 1px solid rgba(100, 180, 220, 0.3); text-align: center; opacity: 0; transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);">
    <h1 style="margin: 0; color: #fff; font-size: 2.1em; font-weight: 300; letter-spacing: 0.08em; white-space: nowrap;">Nate S. Woodward</h1>
    <p style="margin: 0.4em 0 0 0; color: rgba(100, 180, 220, 0.9); font-size: 1.17em; font-weight: 300; letter-spacing: 0.1em;">ML + Theoretical Physics</p>
  </div>
</div>
<script src="/assets/js/quantum-foam.js"></script>

<div style="max-width: 800px; margin: 2.5em auto; padding: 0 2.5em;">

<div style="display: flex; align-items: center; gap: 2.5em; margin-bottom: 2.5em; flex-wrap: wrap; justify-content: center;">
  <div style="flex-shrink: 0;">
    <img src="/images/8B550177-F22B-488C-8244-24DA3DFCCC7A_1_105_c.jpeg" alt="Nate S. Woodward" style="width: 180px; border-radius: 50%; border: 2px solid rgba(100, 180, 220, 0.4);">
  </div>
  <div style="text-align: left;">
    <p style="margin: 0 0 0.3em 0; font-size: 1.1em; font-weight: 500;">PhD Student @ UW-Madison</p>
    <p style="margin: 0 0 0.8em 0; font-size: 0.95em; color: rgba(255,255,255,0.7);">MIT '25 Physics + Math</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4em 2em; font-size: 0.95em;">
      <a href="mailto:nwoodward2@wisc.edu"><i class="fas fa-fw fa-envelope"></i> Email</a>
      <a href="https://github.com/nswood"><i class="fab fa-fw fa-github"></i> GitHub</a>
      <a href="https://scholar.google.com/citations?user=4nDrH1cAAAAJ&hl=en"><i class="ai ai-google-scholar"></i> Scholar</a>
      <a href="https://www.linkedin.com/in/nswoodward"><i class="fab fa-fw fa-linkedin"></i> LinkedIn</a>

    </div>
  </div>
</div>

<p>I am a PhD student at the University of Wisconsin–Madison, where I develop machine learning techniques for theoretical physics. My current research focuses on improving LLM reasoning for theoretical physics.</p>

<p>I graduated from MIT in 2025 with degrees in Physics and Mathematics. During my undergraduate studies I worked in Professor Phil Harris's group and with the NSF AI Institute for Artificial Intelligence and Fundamental Interactions (IAIFI), building ML tools for high‑energy physics. My experience spans geometric ML for jet physics, detector readout algorithms, and theoretical QFT calculations.</p>

<h2>Recent Publications</h2>

{% assign sorted_pubs = site.publications | sort: "date" | reverse %}

{% for post in sorted_pubs limit:3 %}
{% if post.link %}
<p style="margin: 0.5em 0;">• <a href="{{ post.link }}">{{ post.title }}</a> ({{ post.date | date: "%Y" }})</p>
{% elsif post.paperurl %}
<p style="margin: 0.5em 0;">• <a href="{{ post.paperurl }}">{{ post.title }}</a> ({{ post.date | date: "%Y" }})</p>
{% else %}
<p style="margin: 0.5em 0;">• <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date: "%Y" }})</p>
{% endif %}
{% endfor %}

<h2>Recent Posts</h2>

{% for post in site.posts limit:3 %}
{% if post.title %}
<p style="margin: 0.5em 0;">• <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date: "%Y-%m-%d" }})</p>
{% endif %}
{% endfor %}

<h2>Recent Talks</h2>

{% assign sorted_talks = site.talks | sort: "date" | reverse %}

{% for post in sorted_talks limit:3 %}
<p style="margin: 0.5em 0;">• <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date: "%Y" }})</p>
{% endfor %}

</div>
