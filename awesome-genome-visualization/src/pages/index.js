import React, { useState, useEffect } from 'react'
import { tools as importedTools } from './TOOLS.json'
import slugify from 'slugify'
import queryString from 'query-string'
import './App.css'

const Cards = ({ tools, filters, setSelected, setFilters }) => {
  return tools.map(row => (
    <Card
      row={row}
      key={row.name}
      setSelected={setSelected}
      setFilters={setFilters}
      filters={filters}
    />
  ))
}

const Card = ({
  setSelected,
  row: {
    name,
    url,
    language,
    tags,
    img,
    width,
    height,
    github,
    twitter,
    platform,
    github_stars,
    pub,
    note,
    alt_url,
  },
  filters,
  setFilters,
}) => {
  const [expanded, setExpanded] = useState(false)
  const slug = slugify(name, { remove: /[*+~.()'"!:@]/g })
  return (
    <div className="card">
      <div>
        <h3>
          <a
            id={slug}
            href="#"
            style={{ color: 'black', cursor: 'pointer' }}
            onClick={event => {
              setSelected({ selected: '#' + slug })
              event.preventDefault()
            }}
          >
            {name}
          </a>
        </h3>
        <p className="link">
          <a href={url}>{url}</a>
        </p>
        {alt_url ? (
          <p className="link">
            Alt url <a href={alt_url}>{alt_url}</a>
          </p>
        ) : null}
        {pub ? (
          <p>
            Publication: {pub.url ? <a href={pub.url}>(direct link)</a> : null}{' '}
            {pub.doi ? (
              <a
                href={
                  pub.doi.startsWith('http')
                    ? pub.doi
                    : 'https://dx.doi.org/' + pub.doi
                }
              >
                (doi link)
              </a>
            ) : null}{' '}
            {pub.year ? ` (${pub.year})` : null}
            {pub.citations !== undefined
              ? ` (# citations ${pub.citations})`
              : null}
          </p>
        ) : null}
        {language ? <p>Language: {language.join(', ')}</p> : null}
        {tags ? (
          <p>
            Tags:{' '}
            {tags.map((tag, index) => [
              index > 0 && ', ',
              <a
                key={tag + '-' + index}
                onClick={event => {
                  setFilters({ ...filters, tag })
                  event.preventDefault()
                }}
              >
                {tag}
              </a>,
            ])}
          </p>
        ) : null}
        {note ? <p>Note: {note}</p> : null}
        {twitter ? (
          <p className="link">
            Twitter: <a href={twitter}>{twitter}</a>
          </p>
        ) : null}
        {github ? (
          <p className="link">
            Github: <a href={github}>{github}</a>
          </p>
        ) : null}

        {github_stars ? <p>Github Stargazers: {github_stars}</p> : null}
        {platform ? <p>Platform: {platform.join(', ')}</p> : null}
      </div>
      <figure role="presentation" onClick={() => setExpanded(state => !state)}>
        {img ? (
          <img
            alt={`screenshot of ${name}`}
            loading="lazy"
            className={expanded ? 'expanded' : ''}
            width={width}
            height={height}
            src={img}
          />
        ) : (
          <p className="no-screenshot">No screenshot</p>
        )}
        {expanded ? (
          <div className="modal-backdrop">
            <img alt={`screenshot of ${name}`} src={img} />
          </div>
        ) : null}
      </figure>
    </div>
  )
}

const TagFilters = ({ tools, setFilters, filters }) => {
  const tags = new Set()
  tools.forEach(tool => {
    if (tool.tags) {
      tool.tags.forEach(cat => tags.add(cat))
    }
  })
  return (
    <div className="form-group">
      <label htmlFor="tag-select">Filter based on tag: </label>
      <select
        id="tag-select"
        value={filters.tag || ''}
        onChange={event => setFilters({ ...filters, tag: event.target.value })}
      >
        <option value="">-- select an option --</option>
        {[...tags].sort().map(tag => (
          <option key={tag} id={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  )
}

const LanguageFilters = ({ tools, setFilters, filters }) => {
  const languages = new Set()
  tools.forEach(tool => {
    if (tool.language) {
      tool.language.forEach(cat => languages.add(cat))
    }
  })
  return (
    <div className="form-group">
      <label htmlFor="language-select">Filter based on language: </label>
      <select
        value={filters.language || ''}
        id="language-select"
        onChange={event =>
          setFilters({ ...filters, language: event.target.value })
        }
      >
        <option value="">-- select an option --</option>
        {[...languages].sort().map(tag => (
          <option key={tag} id={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  )
}

const PlatformFilters = ({ tools, setFilters, filters }) => {
  const platform = new Set()
  tools.forEach(tool => {
    if (tool.platform) {
      tool.platform.forEach(cat => platform.add(cat))
    }
  })
  return (
    <div className="form-group">
      <label htmlFor="platform-select">Filter based on platform: </label>
      <select
        value={filters.platform || ''}
        id="platform-select"
        onChange={event =>
          setFilters({ ...filters, platform: event.target.value })
        }
      >
        <option value="">-- select an option --</option>
        {[...platform].sort().map(tag => (
          <option key={tag} id={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  )
}
const IndexPage = () => {
  const [filters, setFilters] = useState({})
  const [alreadyScrolledTo, setAlreadyScrolledTo] = useState(false)
  const [sort, setSort] = useState({})
  const [selected, setSelected] = useState({})
  const { language, tag, platform } = filters

  useEffect(() => {
    const {
      selected,
      language,
      tag,
      platform,
      latest = true,
      citations,
      year,
      stars,
    } = queryString.parse(window.location.search)
    setFilters({ language, tag, platform })
    if (citations || year || stars) {
      setSort({ citations, year, stars })
    } else {
      setSort({ latest })
    }
    setSelected({ selected })
  }, [])

  useEffect(() => {
    const params = queryString.stringify({ ...filters, ...sort, ...selected })
    window.history.pushState(null, null, '?' + params)

    if (selected.selected && !alreadyScrolledTo) {
      let target = document.querySelector(selected.selected)
      if (target) {
        target.scrollIntoView({
          block: 'start',
        })
      }
      setAlreadyScrolledTo(true)
    }
  }, [filters, sort, selected, alreadyScrolledTo])

  let tools = importedTools.slice()
  if (sort.latest) {
    tools = tools.reverse()
  }

  if (sort.year !== undefined) {
    tools = tools.sort(
      (a, b) =>
        +(a.pub?.year || Infinity * sort.year) -
        +(b.pub?.year || Infinity * sort.year),
    )
    if (sort.year === -1) {
      tools = tools.reverse()
    }
  }

  if (sort.citations !== undefined) {
    tools = tools.sort(
      (a, b) =>
        +(a.pub?.citations || Infinity * sort.citations) -
        +(b.pub?.citations || Infinity * sort.citations),
    )
    if (sort.citations === -1) {
      tools = tools.reverse()
    }
  }

  if (sort.stars !== undefined) {
    tools = tools.sort(
      (a, b) =>
        +(a.github_stars || Infinity * sort.stars) -
        +(b.github_stars || Infinity * sort.stars),
    )
    if (sort.stars === -1) {
      tools = tools.reverse()
    }
  }

  const filteredTools = tools
    .filter(tool => (language ? tool.language?.includes(language) : true))
    .filter(tool => (tag ? tool.tags?.includes(tag) : true))
    .filter(tool => (platform ? tool.platform?.includes(platform) : true))

  const githubURL = 'https://github.com/cmdcolin/awesome-genome-visualization'

  return (
    <main className="page">
      <title>awesome-genome-visualization</title>
      <h1>awesome-genome-visualization</h1>
      <p>
        This is a companion website for the github repo{' '}
        <a href={githubURL}>{githubURL}</a>
      </p>
      <p>
        Also check out our twitter account{' '}
        <a href="https://twitter.com/awesomegenomev1">@awesomegenomev1</a>
      </p>
      <div style={{ maxWidth: 500 }}>
        <p>Feel free to submit PRs to add more tools</p>
      </div>

      <p className="example-buttons">
        Filters:
        <button onClick={() => setFilters({})}>Clear filters</button>
        <button onClick={() => setFilters({ tag: 'General' })}>
          General-purpose genome browsers
        </button>
        <button onClick={() => setFilters({ tag: 'Comparative' })}>
          Synteny/comparative browsers
        </button>
        <button onClick={() => setFilters({ tag: 'Dotplot' })}>
          Dotplot viewer
        </button>
        <button onClick={() => setFilters({ tag: 'MSA' })}>MSA viewer</button>
        <button onClick={() => setFilters({ tag: 'Graph' })}>
          Graph genome
        </button>
        <button onClick={() => setFilters({ tag: 'Text based' })}>
          Text based
        </button>
      </p>
      <p className="example-buttons">
        <br />
        <br />
        <br />
        <b>
          Before clicking these sort routines: Try to avoid being unfairly
          biased by citation numbers and github stars!! Best effort was made to
          find the right DOI and github repo
        </b>
        <br />
        <br />
        Sorts:
        <button onClick={() => setSort({ latest: true })}>
          Recently added
        </button>
        <button onClick={() => setSort({})}>Least recently added</button>
        <button onClick={() => setSort({ year: -1 })}>Year (dec)</button>
        <button onClick={() => setSort({ year: 1 })}>Year (asc)</button>
        <button onClick={() => setSort({ citations: -1 })}>
          Number citations (dec)
        </button>
        <button onClick={() => setSort({ citations: 1 })}>
          Number citations (asc)
        </button>
        <button onClick={() => setSort({ stars: -1 })}>
          Github stars (dec)
        </button>
        <button onClick={() => setSort({ stars: 1 })}>
          Github stars (asc)
        </button>
      </p>

      <p className="example-buttons">
        Selection:
        <button onClick={() => setSelected({})}>Clear selection</button>
      </p>

      <div id="filters">
        <TagFilters
          tools={importedTools}
          filters={filters}
          setFilters={setFilters}
        />
        <LanguageFilters
          tools={importedTools}
          filters={filters}
          setFilters={setFilters}
        />
        <PlatformFilters
          tools={importedTools}
          filters={filters}
          setFilters={setFilters}
        />
      </div>

      <Cards
        filters={filters}
        tools={filteredTools}
        setSelected={setSelected}
        setFilters={setFilters}
      />
      <p>
        Note: if you would like your tool removed or screenshot removed (for
        copyright purposes for example) let me know
      </p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        onClick={() => window.scrollTo(0, 0)}
        className="top-link"
        viewBox="0 0 12 6"
      >
        <path d="M12 6H0l6-6z" />
      </svg>
    </main>
  )
}

export default IndexPage
