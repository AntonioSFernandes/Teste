<script lang="ts">
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    let { recurso } = data;
</script>

<pre>
    {JSON.stringify(recurso, null, 2)}
</pre>
