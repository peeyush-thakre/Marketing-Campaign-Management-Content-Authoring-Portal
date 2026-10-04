$(function () {
  const defaultCampaigns = [
    {id:1,name:"Digital Transformation 2026",audience:"Enterprise Clients",start:"2026-09-01",end:"2026-10-31",budget:150000, status:"Active",conversion:8.6},
    {id:2,name:"Cloud Solutions Launch",audience:"Technology Leaders",start:"2026-08-15",end:"2026-09-30",budget:95000, status:"Completed",conversion:6.8},
    {id:3,name:"Customer Engagement",audience:"Marketing Teams",start:"2026-10-01",end:"2026-11-15",budget:80000, status:"Active",conversion:7.4},
    {id:4,name:"AI Innovation Webinar",audience:"Business Decision Makers",start:"2026-11-01",end:"2026-11-20",budget:45000, status:"Draft",conversion:0}
  ];
  const defaultContent = [
    {id:1,title:"Digital Transformation",category:"Landing Page",description:"Explore how technology and human ingenuity can create measurable business value.",status:"Published"},
    {id:2,title:"Cloud Services",category:"Product Page",description:"A reusable content section for cloud solutions, capabilities and customer outcomes.",status:"Review"},
    {id:3,title:"AI Innovation Webinar",category:"Event Page",description:"Event content with registration details, agenda and speaker information.",status:"Draft"}
  ];

  let campaigns = JSON.parse(localStorage.getItem("campaigns")) || defaultCampaigns;
  let content = JSON.parse(localStorage.getItem("content")) || defaultContent;

  function save() {
    localStorage.setItem("campaigns", JSON.stringify(campaigns));
    localStorage.setItem("content", JSON.stringify(content));
  }
  function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function badge(status) { return `<span class="badge ${status}">${escapeHtml(status)}</span>`; }

  function renderAll() {
    renderDashboard();
    renderCampaigns();
    renderContent();
    renderAnalytics();
  }

  function renderDashboard() {
    const total = campaigns.length;
    const active = campaigns.filter(c => c.status === "Active").length;
    const budget = campaigns.reduce((s,c) => s + Number(c.budget), 0);
    const avg = total ? campaigns.reduce((s,c) => s + Number(c.conversion), 0) / total : 0;
    $("#totalCampaigns").text(total);
    $("#activeCampaigns").text(active);
    $("#totalBudget").text(money(budget));
    $("#avgConversion").text(avg.toFixed(1) + "%");

    $("#recentCampaigns").html(campaigns.slice(-4).reverse().map(c =>
      `<div class="recent-item"><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.audience)} · ${badge(c.status)}</small></div>`
    ).join("") || "<p>No campaigns yet.</p>");

    const counts = {
      Published: content.filter(x => x.status === "Published").length,
      Draft: content.filter(x => x.status === "Draft").length,
      Review: content.filter(x => x.status === "Review").length
    };
    $("#publishedCount").text(counts.Published);
    $("#draftCount").text(counts.Draft);
    $("#reviewCount").text(counts.Review);
    const max = Math.max(content.length,1);
    $("#publishedBar").css("width", counts.Published/max*100+"%");
    $("#draftBar").css("width", counts.Draft/max*100+"%");
    $("#reviewBar").css("width", counts.Review/max*100+"%");
  }

  function renderCampaigns() {
    const q = $("#campaignSearch").val()?.toLowerCase() || "";
    const filter = $("#statusFilter").val() || "all";
    const list = campaigns.filter(c =>
      (filter === "all" || c.status === filter) &&
      (c.name.toLowerCase().includes(q) || c.audience.toLowerCase().includes(q))
    );
    $("#campaignTable").html(list.map(c => `
      <tr>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td>${escapeHtml(c.audience)}</td>
        <td>${escapeHtml(c.start)}<br>${escapeHtml(c.end)}</td>
        <td>${money(c.budget)}</td>
        <td>${badge(c.status)}</td>
        <td>${Number(c.conversion).toFixed(1)}%</td>
        <td><button class="delete-btn delete-campaign" data-id="${c.id}">Delete</button></td>
      </tr>`).join(""));
    $("#emptyCampaigns").toggleClass("hidden", list.length !== 0);
  }

  function renderContent() {
    const q = $("#contentSearch").val()?.toLowerCase() || "";
    const filter = $("#contentFilter").val() || "all";
    const list = content.filter(x =>
      (filter === "all" || x.status === filter) &&
      (x.title.toLowerCase().includes(q) || x.category.toLowerCase().includes(q))
    );
    $("#contentGrid").html(list.map(x => `
      <article class="content-card">
        ${badge(x.status)}
        <h3>${escapeHtml(x.title)}</h3>
        <div class="meta">${escapeHtml(x.category)}</div>
        <p>${escapeHtml(x.description)}</p>
        <button class="delete-btn delete-content" data-id="${x.id}">Delete</button>
      </article>`).join(""));
    $("#emptyContent").toggleClass("hidden", list.length !== 0);
  }

  function renderAnalytics() {
    const max = Math.max(...campaigns.map(c => Number(c.conversion)), 1);
    $("#analyticsChart").html(campaigns.map(c => {
      const h = Math.max((Number(c.conversion)/max)*220, 8);
      return `<div class="bar-wrap"><div class="bar-value">${Number(c.conversion).toFixed(1)}%</div><div class="bar" style="height:${h}px"></div><div class="bar-label">${escapeHtml(c.name)}</div></div>`;
    }).join(""));
    const best = campaigns.length ? campaigns.reduce((a,b) => Number(a.conversion)>Number(b.conversion)?a:b) : null;
    $("#summaryList").html(`
      <div class="summary-item"><span>Total campaigns</span><strong>${campaigns.length}</strong></div>
      <div class="summary-item"><span>Active campaigns</span><strong>${campaigns.filter(c=>c.status==="Active").length}</strong></div>
      <div class="summary-item"><span>Highest conversion</span><strong>${best ? Number(best.conversion).toFixed(1)+"%" : "0%"}</strong></div>
      <div class="summary-item"><span>Top campaign</span><strong>${best ? escapeHtml(best.name) : "N/A"}</strong></div>
    `);
  }

  function navigate(section) {
    $(".page-section").removeClass("active-section");
    $("#" + section).addClass("active-section");
    $(".nav-link").removeClass("active");
    $(`.nav-link[data-section="${section}"]`).addClass("active");
    const titles = {dashboard:"Marketing Operations Dashboard",campaigns:"Campaign Management",content:"Content Authoring",analytics:"Marketing Analytics"};
    $("#pageTitle").text(titles[section]);
    $(".sidebar").removeClass("open");
  }

  $(".nav-link").on("click", function(e){ e.preventDefault(); navigate($(this).data("section")); });
  $("[data-go]").on("click", function(){ navigate($(this).data("go")); });
  $("#menuBtn").on("click", ()=>$(".sidebar").toggleClass("open"));

  $("#campaignSearch,#statusFilter").on("input change", renderCampaigns);
  $("#contentSearch,#contentFilter").on("input change", renderContent);

  $("#newCampaignBtn").on("click", ()=>$("#campaignModal").addClass("open"));
  $("#newContentBtn").on("click", ()=>$("#contentModal").addClass("open"));
  $(".close-modal").on("click", function(){$(this).closest(".modal").removeClass("open")});
  $(".modal").on("click", function(e){ if(e.target===this) $(this).removeClass("open"); });

  $("#campaignForm").on("submit", function(e){
    e.preventDefault();
    const start = $("#campaignStart").val(), end = $("#campaignEnd").val();
    if(end < start){ $("#campaignError").text("End date must be after the start date."); return; }
    campaigns.push({
      id: Date.now(),
      name: $("#campaignName").val().trim(),
      audience: $("#campaignAudience").val().trim(),
      start, end,
      budget: Number($("#campaignBudget").val()),
      conversion: Number($("#campaignConversion").val()) || 0,
      status: $("#campaignStatus").val()
    });
    save(); renderAll(); this.reset(); $("#campaignModal").removeClass("open"); $("#campaignError").text("");
  });

  $("#contentForm").on("submit", function(e){
    e.preventDefault();
    content.push({
      id: Date.now(),
      title: $("#contentTitle").val().trim(),
      category: $("#contentCategory").val().trim(),
      description: $("#contentDescription").val().trim(),
      status: $("#contentStatus").val()
    });
    save(); renderAll(); this.reset(); $("#contentModal").removeClass("open");
  });

  $(document).on("click",".delete-campaign",function(){
    const id = Number($(this).data("id"));
    if(confirm("Delete this campaign?")){ campaigns = campaigns.filter(c=>c.id!==id); save(); renderAll(); }
  });
  $(document).on("click",".delete-content",function(){
    const id = Number($(this).data("id"));
    if(confirm("Delete this content?")){ content = content.filter(c=>c.id!==id); save(); renderAll(); }
  });

  renderAll();
});
