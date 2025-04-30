<script lang="ts">
	import sample from './sample.json'
</script>

<h2>Welcome to Svalendar</h2>

<section class="section" aria-label="introduction">
	<p>
		Svalendar is an open-source calendar app designed to help you organize your life.
		It provides a simple and privacy-focused way to manage your schedule across
		devices.
	</p>
</section>

<section class="section">
	<h3>Features</h3>

	<ul class="list">
		<li>
			<strong>Mobile-Friendly:</strong> The app is fully responsive and works well on
			mobile devices, tablets, and desktops.
		</li>
		<li>
			<strong>Open Source:</strong> The code is open for anyone to view, contribute
			to, or host themselves.
			<a href="http://github.com/ScriptRaccoon/svalendar" target="_blank"
				>View the GitHub repository</a
			>.
		</li>
		<li>
			<strong>No Vendor Lock-In:</strong> The app does not depend on services like Google
			or Microsoft, so your data stays under your control.
		</li>
		<li>
			<strong>Backup to JSON:</strong> Calendars can be backed up to a JSON file for
			easy data portability.
		</li>
		<li>
			<strong>Multiple Calendars:</strong> Create and manage separate calendars for different
			purposes.
		</li>
		<li>
			<strong>Calendar Sharing:</strong> Calendars can be shared with other users in
			an easy way, with three permission levels: <i>read</i>, <i>write</i>, and
			<i>owner</i>.
		</li>
	</ul>
</section>

<section class="section">
	<h3>Privacy and Simplicity</h3>

	<p>
		The app avoids third-party integrations and unnecessary client-side JavaScript,
		ensuring a fast and secure experience. Most functionality works without
		client-side JavaScript, thanks to SvelteKit's form actions.
	</p>
</section>

<section class="section">
	<h3>Data Security</h3>

	<p>
		The titles, descriptions, and locations of all calendar events are encrypted in
		the database. This means that even if someone gains access to the database, they
		cannot read your event details without the encryption keys.
	</p>

	<details>
		<summary>Show me an example</summary>
		<div>
			<p>
				For example, a calendar entry titled <i>"Prepare dinner"</i>, described as
				<i>"Cook pasta for family"</i>, and located at <i>"Home Kitchen"</i>, will
				be saved in the database similar to this:
			</p>
			<pre>{JSON.stringify(sample, null, 4)}</pre>
			<p>The title, description, and location are all encrypted.</p>
		</div>
	</details>
</section>

<section class="section">
	<h3>Technology</h3>

	<p>
		This app is built with <strong>SvelteKit</strong>, a modern framework for creating
		fast and lightweight web applications. It uses <strong>SQLite</strong> for data storage,
		ensuring reliability and simplicity. The combination of these technologies allows the
		app to function efficiently without unnecessary complexity.
	</p>
</section>

<section class="section">
	<h3>Get Started</h3>

	<p>
		You can <a href="/register">register</a> to create an account and start organizing
		your schedule. If you already have an account, <a href="/login">log in</a> to access
		your calendars.
	</p>
</section>
